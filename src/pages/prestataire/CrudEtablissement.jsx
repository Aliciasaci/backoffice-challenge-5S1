import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Badge } from 'primereact/badge';
import { classNames } from 'primereact/utils';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const CrudEtablissement = () => {
    let emptyEtablissement = {
        id: null,
        prestataire: null,
        nom: '',
        adresse: '',
        kbis: '',
        validation: false,
        jours_ouverture: '',
        horraires_ouverture: '',
    };

    const [etablissements, setEtablissements] = useState([]);
    const [etablissementDialog, setEtablissementDialog] = useState(false);
    const [deleteEtablissementDialog, setDeleteEtablissementDialog] = useState(false);
    const [etablissement, setEtablissement] = useState(emptyEtablissement);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchEtablissements = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/etablissements');
                const data = response['data']['hydra:member'];
                setEtablissements(data);
            } catch (error) {
                console.log("error", error);
            }
        }

        fetchEtablissements();
    }, []);

    const openNew = () => {
        setEtablissement(emptyEtablissement);
        setSubmitted(false);
        setEtablissementDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEtablissementDialog(false);
    };

    const hideDeleteEtablissementDialog = () => {
        setDeleteEtablissementDialog(false);
    };

    const saveEtablissement = async (etablissement) => {
        setSubmitted(true);
        if (etablissement.nom.trim()) {
            let _etablissements = [...etablissements];
            let _etablissement = { ...etablissement };
            if (etablissement.id) {
                const response = await axios.patch(`http://localhost:8000/api/etablissements/${etablissement.id}`, {
                    prestataire: null,
                    nom: etablissement.nom,
                    adresse: etablissement.adresse,
                    kbis: etablissement.kbis,
                    validation: etablissement.validation,
                    jours_ouverture: etablissement.jours_ouverture,
                    horraires_ouverture: etablissement.horraires_ouverture,
                },
                {
                    headers: {
                        'Content-Type': 'application/merge-patch+json',
                    },
                });
                _etablissement = response['data'];
                _etablissements[_etablissements.findIndex((el) => el.id === etablissement.id)] = _etablissement;

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Etablissement modifié', life: 3000 });
            } else {
                const response = await axios.post('http://localhost:8000/api/etablissements', {
                    prestataire: null,
                    nom: etablissement.nom,
                    adresse: etablissement.adresse,
                    kbis: etablissement.kbis,
                    validation: etablissement.validation,
                    jours_ouverture: etablissement.jours_ouverture,
                    horraires_ouverture: etablissement.horraires_ouverture,  
                });
                _etablissement = response['data'];
                _etablissements.push(_etablissement);

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Etablissement crée', life: 3000 });
            }

            setEtablissements(_etablissements);
            setEtablissementDialog(false);
            setEtablissement(emptyEtablissement);
        }
    };

    const editEtablissement = async (etablissement) => {
        setEtablissement({ ...etablissement });
        setEtablissementDialog(true);
    };

    const confirmDeleteEtablissement = (etablissement) => {
        setEtablissement(etablissement);
        setDeleteEtablissementDialog(true);
    };

    const deleteEtablissement = async (etablissement) => {
        const response = axios.delete(`http://localhost:8000/api/etablissements/${etablissement.id}`);
        let _etablissements = etablissements.filter((val) => val.id !== etablissement.id);
        setEtablissements(_etablissements);
        setDeleteEtablissementDialog(false);
        setEtablissement(emptyEtablissement);
        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Etablissement supprimé', life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _etablissement = { ...etablissement };
        _etablissement[`${name}`] = val;

        setEtablissement(_etablissement);
    };

    const leftToolbarTemplate = () => {
        return (
            <>
                <div className="my-2">
                    <Button label="Ajouter" icon="pi pi-plus" severity="sucess" className="mr-2" onClick={openNew} />
                </div>
            </>
        );
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
                {rowData.nom}
            </>
        );
    };

    const adresseBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Adresse</span>
                {rowData.adresse}
            </>
        );
    };

    const validationBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Validation</span>
                <Badge value={rowData.validation === false ? "En attente" : "Validé"} severity={rowData.validation === false ? "warning" : rowData.validation === true ? "success" : "danger"} />
            </>
        );
    };

    const joursBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Jours ouverture</span>
                {rowData.jours_ouverture}
            </>
        );
    };

    const horrairesBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Horraires</span>
                {rowData.horraires_ouverture}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => editEtablissement(rowData)} />
                <Button icon="pi pi-trash" severity="warning" rounded onClick={() => confirmDeleteEtablissement(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestion etablissements</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const etablissementDialogFooter = (etablissement) => (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={() => saveEtablissement(etablissement)} />
        </>
    );

    const deleteEtablissementDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteEtablissementDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={() => deleteEtablissement(etablissement)} />
        </>
    );
    
    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={etablissements}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Afficher de {first} à {last} sur {totalRecords} etablissements"
                        globalFilter={globalFilter}
                        emptyMessage="Aucun etablissement trouvé."
                        header={header}
                    >
                        <Column field="id" header="ID" sortable body={idBodyTemplate}></Column>
                        <Column field="nom" header="Nom" sortable body={nomBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="adresse" header="Adresse" sortable body={adresseBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="validation" header="Validation" sortable body={validationBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="horraires_ouverture" header="Horraires ouverture" sortable body={horrairesBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={etablissementDialog} style={{ width: '450px' }} header="Gestion etablissements" modal className="p-fluid" footer={etablissementDialogFooter(etablissement)} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nom">Nom</label>
                            <InputText id="nom" value={etablissement.nom} onChange={(e) => onInputChange(e, 'nom')} required autoFocus className={classNames({ 'p-invalid': submitted && !etablissement.nom })} />
                            {submitted && !etablissement.nom && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="adresse">Adresse</label>
                            <InputText id="adresse" value={etablissement.adresse} onChange={(e) => onInputChange(e, 'adresse')} required className={classNames({ 'p-invalid': submitted && !etablissement.adresse })} />
                            {submitted && !etablissement.adresse && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="horraires_ouverture">Horraires d'ouverture</label>
                            <InputText id="horraires_ouverture" value={etablissement.horraires_ouverture} onChange={(e) => onInputChange(e, 'horraires_ouverture')} required className={classNames({ 'p-invalid': submitted && !etablissement.horraires_ouverture })} />
                            {submitted && !etablissement.horraires_ouverture && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteEtablissementDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteEtablissementDialogFooter} onHide={hideDeleteEtablissementDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {etablissement && (
                                <span>
                                    Etes vous sûr de vouloir supprimer <b>{etablissement.nom}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CrudEtablissement;
