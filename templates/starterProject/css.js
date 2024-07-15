export const css = `
.fieldGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    align-content: center;
    gap: 1rem;

    margin-top: 1rem;
}

.spacing {
    margin: 1rem 0 1rem 0;
}

.houseDetailsHeader {
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    font-size: 1rem;

    font-weight: bold;
    border-bottom: 1px solid lightgray;
}

.accountNote {
    margin-top: 2rem;
    padding-top: 1rem;

    border-top: 1px solid lightgray;
}

.submitButton {
    display: flex;
    justify-content: flex-end;

    margin-top: 3rem;
}

`;
