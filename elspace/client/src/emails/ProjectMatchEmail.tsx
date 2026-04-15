import React from 'react';

export const ProjectMatchEmail = ({ clientName, projectTitle, matches }: { clientName: string, projectTitle: string, matches: any[] }) => (
  <div>
    <h1>Matches Ready for "{projectTitle}"</h1>
    <p>Hi {clientName}, we found some great matches for your project.</p>
  </div>
);
