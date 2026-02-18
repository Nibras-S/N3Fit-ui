import Providers from './providers';
import AppRoutes from './routes';

/**
 * Thin app shell — all logic lives in providers and routes.
 */
function App() {
    return (
        <Providers>
            <div className="App min-h-screen font-sans">
                <AppRoutes />
            </div>
        </Providers>
    );
}

export default App;
