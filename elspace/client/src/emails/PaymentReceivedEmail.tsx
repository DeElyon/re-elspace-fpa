import React from 'react';

export const PaymentReceivedEmail = ({ freelancerName, amount, projectTitle }: { freelancerName: string, amount: number, projectTitle: string }) => (
  <div>
    <h1>Payment Received!</h1>
    <p>Hi {freelancerName}, you have received a payment of ${amount} for "{projectTitle}".</p>
  </div>
);
