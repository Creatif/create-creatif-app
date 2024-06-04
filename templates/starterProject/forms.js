export const propertyForm = `
import { Form, InputText, InputSelectControlled, InputTextarea } from 'creatif-ui-sdk';
import { HouseForm } from './components/HouseForm';
import { ApartmentForm } from './components/ApartmentForm';
import css from './css/root.module.css';
import { StudioForm } from './components/StudioForm';
import { LandForm } from './components/LandForm';
import { RichTextEditor } from './components/RichTextEditor';
import type { Delta } from 'quill/core';

export function PropertyForm() {
    return (
        <Form<{
            address: string;
            city: string;
            postalCode: string;
            propertyStatus: 'Rent' | 'Sell' | 'Rent business' | '';
            propertyType: 'House' | 'Apartment' | 'Studio' | 'Land' | '';

            numOfHouseFloors: number | null;
            houseSize: number | null;
            houseLocalPrice: number | null;
            houseBackYard: boolean;
            houseNeedsRepair: boolean;
            houseBackYardSize: number;
            houseRepairNote: string;

            apartmentFloorNumber: number | null;
            apartmentSize: number | null;
            apartmentLocalPrice: number | null;
            apartmentBalcony: boolean;
            apartmentBalconySize: number | null;

            studioFloorNumber: number | null;
            studioSize: number | null;

            landSize: number | null;
            hasConstructionPermit: number | null;
            
            finalNote: Delta | null;
        }>
            bindings={{
                name: (values) => \`\${values.address}-\${values.city}-\${values.postalCode}\`,
            }}
            formProps={{
                defaultValues: {
                    address: '',
                    city: '',
                    postalCode: '',
                    propertyStatus: '',
                    propertyType: '',

                    numOfHouseFloors: null,
                    houseSize: null,
                    houseLocalPrice: null,
                    houseBackYard: false,
                    houseNeedsRepair: false,
                    houseBackYardSize: null,
                    houseRepairNote: '',

                    apartmentFloorNumber: null,
                    apartmentSize: null,
                    apartmentLocalPrice: null,
                    apartmentBalcony: false,
                    apartmentBalconySize: null,

                    studioFloorNumber: null,
                    studioSize: null,

                    hasConstructionPermit: null,
                    landSize: null,
                    
                    finalNote: null,
                },
            }}
            inputs={(submitButton, { watch, inputReference }) => {
                const propertyType = watch('propertyType');

                return (
                    <>
                        {inputReference({
                            structureName: 'Accounts',
                            name: 'accounts',
                            structureType: 'map',
                            label: 'Account',
                            validation: {
                                required: 'Selecting an owner is required',
                            },
                        })}

                        <div>
                            <div className={css.fieldGrid}>
                                <div>
                                    <InputText
                                        label="Address"
                                        name="address"
                                        options={{
                                            required: 'Address is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputText
                                        label="City"
                                        name="city"
                                        options={{
                                            required: 'City is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputText
                                        label="Postal code"
                                        name="postalCode"
                                        options={{
                                            required: 'Postal code is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputSelectControlled
                                        data={['Rent', 'Sell', 'Rent business']}
                                        label="Property status"
                                        name="propertyStatus"
                                        validation={{
                                            required: 'Property status is required',
                                        }}
                                    />
                                </div>

                                <div>
                                    <InputSelectControlled
                                        data={['House', 'Apartment', 'Studio', 'Land']}
                                        label="Property type"
                                        name="propertyType"
                                        validation={{
                                            required: 'Property type is required',
                                        }}
                                    />
                                </div>
                            </div>

                            {propertyType === 'Apartment' && <ApartmentForm />}
                            {propertyType === 'House' && <HouseForm />}
                            {propertyType === 'Studio' && <StudioForm />}
                            {propertyType === 'Land' && <LandForm />}
                        </div>

                        <div className={css.accountNote}>
                            <RichTextEditor name="finalNote" />
                        </div>

                        <div className={css.submitButton}>{submitButton}</div>
                    </>
                );
            }}
        />
    );
}
`;

export const apartmentForm = `
import { InputCheckbox, InputNumberControlled } from 'creatif-ui-sdk';
import { useCreatifFormContext } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function ApartmentForm() {
    const { watch } = useCreatifFormContext();
    const apartmentBalcony = watch('apartmentBalcony');

    return (
        <div>
            <h1 className={css.houseDetailsHeader}>APARTMENT DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="apartmentFloorNumber"
                        label="Floor number"
                        validation={{
                            required: 'Floor number is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="apartmentSize"
                        label="Size (in meters squared)"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="apartmentLocalPrice"
                        label="Local price (in meters squared)"
                        validation={{
                            required: 'Local price is required',
                        }}
                    />
                </div>

                <div>
                    <InputCheckbox name="apartmentBalcony" label="Has balcony?" />
                </div>
            </div>

            <div className={css.fieldGrid}>
                {apartmentBalcony && (
                    <div>
                        <InputNumberControlled
                            name="apartmentBalconySize"
                            label="Balcony size"
                            validation={{
                                required: 'Balcony size is required',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
`;

export const houseForm = `
import { InputCheckbox, InputNumberControlled, InputTextarea } from 'creatif-ui-sdk';
import { useCreatifFormContext } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function HouseForm() {
    const { watch } = useCreatifFormContext();

    const backYard = watch('houseBackYard');
    const needsRepair = watch('houseNeedsRepair');

    return (
        <div>
            <h1 className={css.houseDetailsHeader}>HOUSE DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="numOfHouseFloors"
                        label="Number of floors"
                        validation={{
                            required: 'Number of floors is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="houseSize"
                        label="Size"
                        description="In meters squared"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="houseLocalPrice"
                        label="Local price"
                        description="Per meters squared"
                        validation={{
                            required: 'Local price is required',
                        }}
                    />
                </div>

                <div>
                    <InputCheckbox name="houseBackYard" label="Has back yard?" />
                </div>

                <div>
                    <InputCheckbox name="houseNeedsRepair" label="Need repair?" />
                </div>
            </div>

            <div className={css.fieldGrid}>
                {backYard && (
                    <div>
                        <InputNumberControlled
                            name="houseBackYardSize"
                            label="Back yard size"
                            description="Size in meters squared"
                            validation={{
                                required: 'Back yard size is required',
                            }}
                        />
                    </div>
                )}

                {needsRepair && (
                    <div
                        style={{
                            gridColumn: 'span 2',
                        }}>
                        <InputTextarea
                            description="The description should be as detailed as possible"
                            resize="both"
                            autosize={true}
                            minRows={2}
                            maxRows={10}
                            name="houseRepairNote"
                            label="Describe the repairs"
                            options={{
                                required: 'Note is required',
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
`;

export const studioForm = `
import { InputNumberControlled } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function StudioForm() {
    return (
        <div>
            <h1 className={css.houseDetailsHeader}>STUDIO DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="studioFloorNumber"
                        label="Floor number"
                        validation={{
                            required: 'Floor number is required',
                        }}
                    />
                </div>

                <div>
                    <InputNumberControlled
                        name="studioSize"
                        label="Size (in meters squared)"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
`;

export const landForm = `
import { InputCheckbox, InputNumberControlled } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function LandForm() {
    return (
        <div>
            <h1 className={css.houseDetailsHeader}>APARTMENT DETAILS</h1>

            <div className={css.fieldGrid}>
                <div>
                    <InputNumberControlled
                        name="landSize"
                        label="Size (in meters squared)"
                        validation={{
                            required: 'Size is required',
                        }}
                    />
                </div>

                <div>
                    <InputCheckbox name="hasConstructionPermit" label="Has construction Permit?" />
                </div>
            </div>
        </div>
    );
}
`;

export const richTextEditor = `
import {useEffect, useRef, useTransition} from 'react';
import Quill from 'quill';
import type {QuillOptions} from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import type { Delta } from 'quill/core';
import {useCreatifFormContext, useCreatifController} from "creatif-ui-sdk";

interface Props {
    name: string;
    placeholder?: string;
}

export function RichTextEditor({name, placeholder}: Props) {
    const {control, setValue, getValues} = useCreatifFormContext();
    const containerRef = useRef();
    const deltaRef = useRef<typeof Delta>(Quill.import('delta'));
    const quillRef = useRef<Quill>(null);
    const [_, setTransition] = useTransition();

    const {
        field,
    } = useCreatifController({
        name,
        control,
    });

    useEffect(() => {
        if (containerRef.current) {
            const options: QuillOptions = {
                debug: 'error',
                modules: {
                    toolbar: true,
                },
                placeholder: placeholder,
                theme: 'snow'
            };

            const quill = new Quill(containerRef.current, options);
            quillRef.current = quill;

            const defaultValue = getValues(name);
            if (defaultValue) {
                const delta = new deltaRef.current(defaultValue);
                quillRef.current.setContents(delta);
                setValue(name, delta);
            }

            quill.on('text-change', (delta) => {
                setTransition(() => {
                    field.onChange(delta);
                    setValue(name, quillRef.current.getContents());
                });
            });
        }
    }, []);

    return <div>
        <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 500,
            marginBottom: '0.5rem',
        }}>Account note</label>
        <div ref={containerRef} />
    </div>;
}
`;

export const accountForm = `
import { Form, InputText } from 'creatif-ui-sdk';
import css from './css/root.module.css';
export function AccountForm() {
    return (
        <Form<{
            name: string;
            lastName: string;
            address: string;
            city: string;
            postalCode: string;
        }>
            bindings={{
                name: (values) => \`\${values.name}-\${values.lastName}-\${values.address}\`,
            }}
            formProps={{
                defaultValues: {
                    name: '',
                    lastName: '',
                    address: '',
                    city: '',
                    postalCode: '',
                },
            }}
            inputs={(submitButton) => (
                <>
                    <div className={css.fieldGrid}>
                        <div>
                            <InputText
                                label="Name"
                                name="name"
                                options={{
                                    required: 'Name is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="Last name"
                                name="lastName"
                                options={{
                                    required: 'Last name is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="Address"
                                name="address"
                                options={{
                                    required: 'Address is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="City"
                                name="city"
                                options={{
                                    required: 'City is required',
                                }}
                            />
                        </div>

                        <div>
                            <InputText
                                label="Postal code"
                                name="postalCode"
                                options={{
                                    required: 'City is required',
                                }}
                            />
                        </div>
                    </div>

                    <div className={css.submitButton}>{submitButton}</div>
                </>
            )}
        />
    );
}
`;
