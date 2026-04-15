import React from 'react';

export const WelcomeEmail = ({ name, role }: { name: string, role: string }) => (
  <div>
    <h1>Welcome, {name}!</h1>
    <p>We are excited to have you as a {role} on EL SPACE.</p>
  </div>
);
