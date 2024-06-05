export const starterApp = `
import React from 'react';
import { CreatifProvider } from 'creatif-ui-sdk';
import { PropertyForm } from './PropertyForm';
import { AccountForm } from './AccountForm';

export default function App() {
    return (
        <CreatifProvider
            app={{
                logo: 'Real Estate Manager',
                projectName: 'project',
                items: [
                    {
                        structureType: 'list',
                        structureName: 'Properties',
                        form: <PropertyForm />,
                    },
                    {
                        structureType: 'map',
                        structureName: 'Accounts',
                        form: <AccountForm />,
                    },
                ],
            }}
        />
    );
}

`;
