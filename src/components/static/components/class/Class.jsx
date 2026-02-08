import React from 'react'
import './Class.css';
import class1 from '../../assets/class-1.jpg';
import class2 from '../../assets/class-2.jpg';

function Class() {
  return (
    <div className="section__container class__container">
      <div className="class__image">
        <span className="bg__blur"></span>
        <img src={class1} alt="class" className="class__img-1" />
        <img src={class2} alt="class" className="class__img-2" />
      </div>
      <div className="class__content">
        <h2 className="section__header">THE CLASS YOU WILL GET HERE</h2>
        <p>
          Led by our team of expert and motivational instructors, "The Class You
          Will Get Here" is a high-energy, results-driven session that combines
          a perfect blend of cardio, strength training, and functional
          exercises. Each class is carefully curated to keep you engaged and
          challenged, ensuring you never hit a plateau in your fitness
          endeavors.
        </p>
        <button className="btn">Book A Class</button>
      </div>
    </div>
  )
}

export default Class
