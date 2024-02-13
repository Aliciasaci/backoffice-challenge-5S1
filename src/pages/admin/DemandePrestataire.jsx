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
import axios from 'axios';

const DemandePrestataire = () => {
    let emptyDemande = {
        id: null,
        prestataire_id: null,
        statut: '',
    };

    const [demandes, setDemandes] = useState([]);
    const [demandeDialog, setDemandeDialog] = useState(false);
    const [demande, setDemande] = useState(emptyDemande);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchDemandes = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/demande_prestataires');
                const data = response['data']['hydra:member'];
                setDemandes(data);
            } catch (error) {
                console.log("error", error);
            }
        }

        fetchDemandes();
    }, []);

    const hideDialog = () => {
        setSubmitted(false);
        setDemandeDialog(false);
    };

    const saveDemande = async (demande) => {
        setSubmitted(true);
        let _demandes = [...demandes];
        let _demande = { ...demande };
        if (demande.id) {
            const response = await axios.patch(`http://localhost:8000/api/demande_prestataires/${demande.id}`, {
                statut: demande.statut,
            },
            {
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                },
            });
            _demande = response['data'];
            _demandes[_demandes.findIndex((el) => el.id === demande.id)] = _demande;

            toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Statut mis à jour.', life: 3000 });
        } 

        setDemandes(_demandes);
        setDemandeDialog(false);
        setDemande(emptyDemande);
       
    };

    const editDemande = async (demande) => {
        setDemande({ ...demande });
        setDemandeDialog(true);
    };

    const onStatutChange = (e) => {
        let _demande = { ...demande };
        _demande['statut'] = e.value;
        setDemande(_demande);
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

    const statutBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Statut</span>
                <Badge value={rowData.statut} severity={rowData.statut === "En attente" ? "warning" : rowData.statut === "Valider" ? "success" : "danger"} />
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => editDemande(rowData)} />
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

    const demandeDialogFooter = (demande) => (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={() => saveDemande(demande)} />
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
                        value={demandes}
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
                        <Column field="statut" header="Statut" sortable body={statutBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={demandeDialog} style={{ width: '450px' }} header="Gestion demandes" modal className="p-fluid" footer={demandeDialogFooter(demande)} onHide={hideDialog}>
                    <div className="field">
                            <label className="mb-3">Validation Prestataire ?</label>
                            <div className="formgrid grid">
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="enAttente" name="statut" value="En attente" onChange={onStatutChange} checked={demande.statut && demande.statut == "En attente"} />
                                    <label htmlFor="enAttente">En attente</label>
                                </div>
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="valider" name="statut" value="Valider" onChange={onStatutChange} checked={demande.statut && demande.statut == "Valider"} />
                                    <label htmlFor="valider">Valider</label>
                                </div>
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="annuler" name="statut" value="Annuler" onChange={onStatutChange} checked={demande.statut && demande.statut == "Annuler"} />
                                    <label htmlFor="annuler">Annuler</label>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default DemandePrestataire;
