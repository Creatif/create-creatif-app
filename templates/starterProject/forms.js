export const propertyForm = `
import { Form, InputText, InputSelectControlled, InputTextarea, Grid, Cell, File } from 'creatif-ui-sdk';
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
                },
            }}
            inputs={(submitButton, { watch, inputConnection, inputLocale, inputGroups, inputFile }) => {
                const propertyType = watch('propertyType');

                return (
                    <Grid>
                        <Cell span="span 12">
                            {inputConnection({
                                structureName: 'Accounts',
                                name: 'accounts',
                                structureType: 'map',
                                label: 'Account',
                                options: {
                                    required: 'Selecting an owner is required',
                                },
                            })}
                        </Cell>

                        <Cell span="span 12">
                            {inputLocale()}
                        </Cell>

                        <Cell span="span 12">
                            {inputGroups()}
                        </Cell>

                        <Cell span="span 4">
                            <InputText
                                label="Address"
                                name="address"
                                options={{
                                    required: 'Address is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 4">
                            <InputText
                                label="City"
                                name="city"
                                options={{
                                    required: 'City is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 4">
                            <InputText
                                label="Postal code"
                                name="postalCode"
                                options={{
                                    required: 'Postal code is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 6">
                            <InputSelectControlled
                                data={['Rent', 'Sell', 'Rent business']}
                                label="Property status"
                                name="propertyStatus"
                                options={{
                                    required: 'Property status is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 6">
                            <InputSelectControlled
                                data={['House', 'Apartment', 'Studio', 'Land']}
                                label="Property type"
                                name="propertyType"
                                options={{
                                    required: 'Property type is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 12">
                            {propertyType === 'Apartment' && <ApartmentForm />}
                        </Cell>

                        <Cell span="span 12">
                            {propertyType === 'House' && <HouseForm />}
                        </Cell>

                        <Cell span="span 12">
                            {propertyType === 'Studio' && <StudioForm />}
                        </Cell>

                        <Cell span="span 12">
                            {propertyType === 'Land' && <LandForm />}
                        </Cell>

                        <Cell span="span 12">
                            <File inputFile={inputFile} name="propertyImages" label="Property images" description="You can upload as much images as you want" fileButtonProps={{
                                multiple: true,
                                accept: "image/jpg,image/jpeg,image/png,image/webp,image/avif"
                            }} />
                        </Cell>

                        <Cell span="span 12">
                            <InputTextarea
                                label="Account note"
                                name="finalNote"
                                description="Describe anything that could not be represented in the fields above"
                            />
                        </Cell>

                        <Cell span="span 12">{submitButton}</Cell>
                    </Grid>
                );
            }}
        />
    );
}

`;

export const apartmentForm = `
import { InputText, Grid, Cell, useCreatifFormContext } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function ApartmentForm() {
    const { watch } = useCreatifFormContext();
    const apartmentBalcony = watch('apartmentBalcony');

    return (
        <Grid cls={[css.spacing]}>
            <Cell span="span 12" cls={[css.houseDetailsHeader]}>APARTMENT DETAILS</Cell>

            <Cell span="span 4">
                <InputNumberControlled
                    name="apartmentFloorNumber"
                    label="Floor number"
                    options={{
                        required: 'Floor number is required',
                    }}
                />
            </Cell>

            <Cell span="span 4">
                <InputNumberControlled
                    name="apartmentSize"
                    label="Size (in meters squared)"
                    options={{
                        required: 'Size is required',
                    }}
                />
            </Cell>

            <Cell span="span 4">
                <InputNumberControlled
                    name="apartmentLocalPrice"
                    label="Local price (in meters squared)"
                    options={{
                        required: 'Local price is required',
                    }}
                />
            </Cell>

            <Cell span="span 12">
                <InputCheckbox name="apartmentBalcony" label="Has balcony?" />
            </Cell>

            {apartmentBalcony && <Cell span="span 12">
                <InputNumberControlled
                    name="apartmentBalconySize"
                    label="Balcony size"
                    options={{
                        required: 'Balcony size is required',
                    }}
                />
            </Cell>}
        </Grid>
    );
}


`;

export const houseForm = `
import { InputCheckbox, InputNumberControlled, InputTextarea, Grid, Cell } from 'creatif-ui-sdk';
import { useCreatifFormContext } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function HouseForm() {
    const { watch } = useCreatifFormContext();

    const backYard = watch('houseBackYard');
    const needsRepair = watch('houseNeedsRepair');

    return (
        <Grid cls={[css.spacing]}>
            <Cell span="span 12" cls={[css.houseDetailsHeader]}>HOUSE DETAILS</Cell>

            <Cell span="span 4">
                <div>
                    <InputNumberControlled
                        name="numOfHouseFloors"
                        label="Number of floors"
                        validation={{
                            required: 'Number of floors is required',
                        }}
                    />
                </div>
            </Cell>

            <Cell span="span 4">
                <InputNumberControlled
                    name="houseSize"
                    label="Size"
                    description="In meters squared"
                    validation={{
                        required: 'Size is required',
                    }}
                />
            </Cell>

            <Cell span="span 4">
                <InputNumberControlled
                    name="houseLocalPrice"
                    label="Local price"
                    description="Per meters squared"
                    validation={{
                        required: 'Local price is required',
                    }}
                />
            </Cell>

            <Cell span="span 12">
                <InputCheckbox name="houseBackYard" label="Has back yard?" />
            </Cell>

            {backYard && <Cell span="span 12">
                <InputNumberControlled
                    name="houseBackYardSize"
                    label="Back yard size"
                    description="Size in meters squared"
                    validation={{
                        required: 'Back yard size is required',
                    }}
                />
            </Cell>}

            <Cell span="span 12">
                <InputCheckbox name="houseNeedsRepair" label="Need repair?" />
            </Cell>

            {needsRepair && <Cell span="span 12">
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
            </Cell>}
        </Grid>
    );
}

`;

export const studioForm = `
import { InputNumberControlled, Grid, Cell } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function StudioForm() {
    return (
        <Grid cls={[css.spacing]}>
            <Cell span="span 12" cls={[css.houseDetailsHeader]}>STUDIO DETAILS</Cell>

            <Cell span="span 6">
                <InputNumberControlled
                    name="studioFloorNumber"
                    label="Floor number"
                    validation={{
                        required: 'Floor number is required',
                    }}
                />
            </Cell>

            <Cell span="span 6">
                <InputNumberControlled
                    name="studioSize"
                    label="Size (in meters squared)"
                    validation={{
                        required: 'Size is required',
                    }}
                />
            </Cell>
        </Grid>
    );
}

`;

export const landForm = `
import { InputCheckbox, InputNumberControlled, Grid, Cell } from 'creatif-ui-sdk';
import css from '../css/root.module.css';

export function LandForm() {
    return (
        <Grid cls={[css.spacing]}>
            <Cell cls={[css.houseDetailsHeader]}>APARTMENT DETAILS</Cell>

            <Cell span="span 12">
                <InputNumberControlled
                    name="landSize"
                    label="Size (in meters squared)"
                    validation={{
                        required: 'Size is required',
                    }}
                />
            </Cell>

            <Cell span="span 12">
                <InputCheckbox name="hasConstructionPermit" label="Has construction Permit?" />
            </Cell>
        </Grid>
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
        <div ref={containerRef} style={{
            height: '120px',
        }} />
    </div>;
}
`;

export const accountForm = `
import { Form, InputText, Grid, Cell, File } from 'creatif-ui-sdk';
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
            inputs={(submitButton, {inputFile}) => (
                <>
                    <Grid>
                        <Cell span="span 12">
                            <InputText
                                label="Name"
                                name="name"
                                options={{
                                    required: 'Name is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 12">
                            <InputText
                                label="Last name"
                                name="lastName"
                                options={{
                                    required: 'Last name is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 3">
                            <InputText
                                label="Address"
                                name="address"
                                options={{
                                    required: 'Address is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 3">
                            <InputText
                                label="City"
                                name="city"
                                options={{
                                    required: 'City is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 3">
                            <InputText
                                label="Postal code"
                                name="postalCode"
                                options={{
                                    required: 'City is required',
                                }}
                            />
                        </Cell>

                        <Cell span="span 12">
                            <File label="Profile image" inputFile={inputFile} name="profileImage" fileButtonProps={{
                                accept: 'image/png,image/jpeg,image/jpg,image/gif,image/webp,image/avif'
                            }} />
                        </Cell>
                    </Grid>

                    <div className={css.submitButton}>{submitButton}</div>
                </>
            )}
        />
    );
}

`;
