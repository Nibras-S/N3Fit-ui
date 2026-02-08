import React from 'react'
import './Price.css'
import PriceCard from '../../cards/priceCard';

function Price() {
  return (
    <div className="section__container price__container">
      <h2 className="section__header">OUR PRICING PLAN</h2>
      <p className="section__subheader">
        Our pricing plan comes with various membership tiers, each tailored to
        cater to different preferences and fitness aspirations.
      </p>
      <div class="price__grid">
        <PriceCard amount='₹1000' plan='1-Month' />
        <PriceCard amount='₹2000' plan='2-Month' />
        <PriceCard amount='₹3000' plan='3-Month' />

      </div>
    </div>
  )
}

export default Price
