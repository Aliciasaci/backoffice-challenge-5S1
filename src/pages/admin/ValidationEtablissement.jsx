import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { RadioButton } from 'primereact/radiobutton';
import { Badge } from 'primereact/badge';
import React, { useEffect, useRef, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const ValidationEtablissement = () => {
    const emptyInvalidEtablissement = {
        id: null,
        nom: '',
        validation: false,
    };

    const axiosPrivate = useAxiosPrivate();

    const [invalidEtablissements, setInvalidEtablissements] = useState([]);
    const [invalidEtablissement, setInvalidEtablissement] = useState(emptyInvalidEtablissement);
    const [invalidEtablissementDialog, setInvalidEtablissementDialog] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchInvalidEtablissement = async () => {
            try {
                const response = await axiosPrivate.get(`etablissements?validation=false`);
                const data = response['data']['hydra:member'];
                setInvalidEtablissements(data);
            } catch (error) {
                console.log("error", error);
            }
        }

        fetchInvalidEtablissement();
    }, []);

    const hideDialog = () => {
        setInvalidEtablissementDialog(false);
    };

    const saveInvalidEtablissement = async (invalidEtablissement) => {
        if (invalidEtablissement.id) {
            let _invalidEtablissements = [...invalidEtablissements];
            let _invalidEtablissement = { ...invalidEtablissement };

            const response = await axiosPrivate.patch(`/etablissements/${invalidEtablissement.id}`, {
                validation: invalidEtablissement.validation,
            },
            {
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                },
            });

            _invalidEtablissement = response['data'];
            const idPrestataire = _invalidEtablissement.prestataire.id;
            const responsePrestataire = await axiosPrivate.patch(`/users/${idPrestataire}`, {
                roles: ["ROLE_USER", "ROLE_PRESTATAIRE"],
            },
            {
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                },
            });

            _invalidEtablissements[_invalidEtablissements.findIndex((el) => el.id === invalidEtablissement.id)] = _invalidEtablissement;
            _invalidEtablissements = _invalidEtablissements.filter((el, index) => el.id !== invalidEtablissement.id);
            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Demande modifiée', life: 3000 });

            setInvalidEtablissementDialog(false);
            setInvalidEtablissement(emptyInvalidEtablissement);
            setInvalidEtablissements(_invalidEtablissements);
        }
    };

    const editInvalidEtablissement = (invalidEtablissement) => {
        setInvalidEtablissement({ ...invalidEtablissement });
        setInvalidEtablissementDialog(true);
    };

    const onValidationChange = (e) => {
        setInvalidEtablissement({ ...invalidEtablissement, [e.target.name]: e.target.value });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const rightToolbarTemplate = () => {
        return (
            <>
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </>
        );
    };

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID</span>
                {rowData.id}
            </>
        );
    };

    const nomBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nom</span>
                {rowData.prestataire.nom} {rowData.prestataire.prenom}
            </>
        );
    };

    const validationBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Validation</span>
                <Badge value={rowData.validation === false ? "En attente" : "Validé"} severity={rowData.validation === false ? "warning" : rowData.validation === true ? "success" : null} />
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => editInvalidEtablissement(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestion demandes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const invalidEtablissementDialogFooter = (invalidEtablissement) => (
        <>
            <Button label="Annuler" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Valider" icon="pi pi-check" text onClick={() => saveInvalidEtablissement(invalidEtablissement)} />
        </>
    );
    
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={invalidEtablissements}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Afficher de {first} à {last} sur {totalRecords} demandes"
                        globalFilter={globalFilter}
                        emptyMessage="Aucune demande trouvée."
                        header={header}
                    >
                        <Column field="id" header="ID" sortable body={idBodyTemplate}></Column>
                        <Column field="nom" header="Nom" sortable body={nomBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="validation" header="Validation" sortable body={validationBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={invalidEtablissementDialog} style={{ width: '450px' }} header="Gestion demandes" modal className="p-fluid" footer={invalidEtablissementDialogFooter(invalidEtablissement)} onHide={hideDialog}>
                        <div className="field">
                            <label className="mb-3">Valider Etablissement ?</label>
                            <div className="formgrid grid">
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="oui" name="validation" value={true} onChange={onValidationChange} checked={invalidEtablissement.validation === true} />
                                    <label htmlFor="oui">Oui</label>
                                </div>
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="non" name="validation" value={false} onChange={onValidationChange} checked={invalidEtablissement.validation === false}/>
                                    <label htmlFor="non">Non</label>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ValidationEtablissement;
