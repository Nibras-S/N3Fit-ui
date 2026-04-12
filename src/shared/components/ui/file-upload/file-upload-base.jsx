import React from 'react';
import { DropZone, FileTrigger, Button } from 'react-aria-components';
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle, FaExclamationCircle, FaTimes, FaRedo } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';

export const getReadableFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Root = ({ children, className }) => {
    return (
        <div className={twMerge("w-full space-y-4", className)}>
            {children}
        </div>
    );
};

const CustomDropZone = ({ isDisabled, onDropFiles, ...props }) => {
    return (
        <DropZone
            {...props}
            onDrop={async (e) => {
                const fileItems = e.items.filter(file => file.kind === 'file');
                const files = await Promise.all(fileItems.map(f => f.getFile()));
                onDropFiles(files);
            }}
            className={({ isDropTarget }) => twMerge(
                "relative w-full px-4 py-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
                isDropTarget ? "border-zinc-900 bg-zinc-50 dark:bg-zinc-800/50" : "border-gray-300 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800",
                isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
        >
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-700/60 text-zinc-900 dark:text-zinc-500 flex items-center justify-center">
                <FaCloudUploadAlt size={24} />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span className="text-zinc-900 dark:text-zinc-500">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Receipts, PDFs, or Images (max. 5MB)
                </p>
            </div>
            <FileTrigger
                allowsMultiple={false}
                onSelect={(e) => {
                    if (!e) return;
                    const files = Array.from(e);
                    onDropFiles(files);
                }}
            >
                <Button isDisabled={isDisabled} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </FileTrigger>
        </DropZone>
    );
};

const List = ({ children, className }) => {
    return (
        <div className={twMerge("w-full flex flex-col gap-3", className)}>
            {children}
        </div>
    );
};

const ListItemProgressBar = ({ name, size, type, progress, failed, onDelete, onRetry }) => {
    return (
        <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm relative group overflow-hidden">
            {/* Absolute loading pattern / effect if desired */}
            {progress < 100 && !failed && (
                <div className="absolute inset-0 bg-zinc-50/30 dark:bg-zinc-800/30 pointer-events-none" />
            )}

            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 z-10">
                <FaFileAlt size={18} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 z-10">
                <div className="flex justify-between items-center mb-1.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate pr-4">{name}</p>
                    <div className="flex-shrink-0">
                        {failed ? (
                            <span className="text-[10px] font-bold tracking-wide text-zinc-700 uppercase flex items-center gap-1"><FaExclamationCircle /> Failed</span>
                        ) : progress === 100 ? (
                            <span className="text-[10px] font-bold tracking-wide text-green-500 uppercase flex items-center gap-1"><FaCheckCircle /> Completed</span>
                        ) : (
                            <span className="text-[10px] font-bold tracking-wide text-zinc-700">{progress}%</span>
                        )}
                    </div>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    {/* Progress bar fill */}
                    <div
                        className={twMerge(
                            "h-full rounded-full transition-all duration-300 relative",
                            failed ? "bg-zinc-900" : progress === 100 ? "bg-green-500" : "bg-zinc-900"
                        )}
                        style={{ width: `${failed ? 100 : progress}%` }}
                    >
                        {progress < 100 && !failed && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{getReadableFileSize(size)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 z-10">
                {failed && (
                    <button type="button" onClick={onRetry} className="p-2 text-gray-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors" title="Retry">
                        <FaRedo size={12} />
                    </button>
                )}
                <button type="button" onClick={onDelete} className="p-2 text-gray-400 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors" title="Remove file">
                    <FaTimes size={14} />
                </button>
            </div>
        </div>
    );
};

export const FileUpload = {
    Root,
    DropZone: CustomDropZone,
    List,
    ListItemProgressBar
};
