import React from 'react';

export const SessionReminderEmail = ({ name, time }: { name: string, time: string }) => (
  <div>
    <h1>Session Reminder</h1>
    <p>Hi {name}, your session starts at {time}.</p>
  </div>
);
