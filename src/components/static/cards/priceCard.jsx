import React from 'react'
import './priceCards.css'

function priceCard(props) {
  return (
    <div>
      <div class="price__card">
          <div class="price__card__content">
            <h4>{props.plan}</h4>
            <h3>{props.amount}</h3>
            <p>
              <i class="ri-checkbox-circle-line"></i>
              Smart workout plan
            </p>
            <p>
              <i class="ri-checkbox-circle-line"></i>
              At home workouts
            </p>
          </div>
          <button class="btn price__btn">Join Now</button>
        </div>
    </div>
  )
}

export default priceCard;
