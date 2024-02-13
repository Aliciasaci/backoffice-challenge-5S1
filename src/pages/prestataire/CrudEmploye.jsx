import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const CrudEmploye = () => {
    let emptyEmploye = {
        id: null,
        etablissement: null,
        nom: '',
        prenom: '',
        horraires_service: '',
        image_name: '',
        description: '',
    };

    const [employes, setEmployes] = useState([]);
    const [employeDialog, setEmployeDialog] = useState(false);
    const [deleteEmployeDialog, setDeleteEmployeDialog] = useState(false);
    const [employe, setEmploye] = useState(emptyEmploye);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchEmployes = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/employes');
                const data = response['data']['hydra:member'];
                console.log("fetchEmploye", data);
                setEmployes(data);
            } catch (error) {
                console.log("error", error);
            }
        }

        fetchEmployes();
    }, []);

    const openNew = () => {
        setEmploye(emptyEmploye);
        setSubmitted(false);
        setEmployeDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEmployeDialog(false);
    };

    const hideDeleteEmployeDialog = () => {
        setDeleteEmployeDialog(false);
    };

    const saveEmploye = async (employe) => {
        setSubmitted(true);
        employe.roles = [employe.roles];
        if (employe.nom.trim()) {
            let _employes = [...employes];
            let _employe = { ...employe };
            if (employe.id) {
                const response = await axios.patch(`http://localhost:8000/api/employes/${employe.id}`, {
                    etablissement: employe.etablissement_id,
                    nom: employe.nom,
                    prenom: employe.prenom,
                    horraires_services: employe.horraires_services,
                    image_name: employe.image_name,
                    description: employe.description,
                },
                {
                    headers: {
                        'Content-Type': 'application/merge-patch+json',
                    },
                });
                _employe = response['data'];
                _employes[_employes.findIndex((el) => el.id === employe.id)] = _employe;

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Employé modifié', life: 3000 });
            } else {
                const response = await axios.post('http://localhost:8000/api/employes', {
                    etablissement: employe.etablissement_id,
                    nom: employe.nom,
                    prenom: employe.prenom,
                    horraires_services: employe.horraires_services,
                    image_name: employe.image_name,
                    description: employe.description,  
                });
                _employe = response['data'];
                _employes.push(_employe);

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Employé crée', life: 3000 });
            }

            setEmployes(_employes);
            setEmployeDialog(false);
            setEmploye(emptyEmploye);
        }
    };

    const editEmploye = async (employe) => {
        setEmploye({ ...employe });
        setEmployeDialog(true);
    };

    const confirmDeleteEmploye = (employe) => {
        setEmploye(employe);
        setDeleteEmployeDialog(true);
    };

    const deleteEmploye = async (employe) => {
        const response = axios.delete(`http://localhost:8000/api/employes/${employe.id}`);
        let _employes = employes.filter((val) => val.id !== employe.id);
        setEmployes(_employes);
        setDeleteEmployeDialog(false);
        setEmploye(emptyEmploye);
        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Employé supprimé', life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _employe = { ...employe };
        _employe[`${name}`] = val;

        setEmploye(_employe);
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

    const idEtablissementBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Etablissement</span>
                {rowData.etablissement.nom}
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


    const prenomBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Prénom</span>
                {rowData.prenom}
            </>
        );
    };

    const horrairesBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Horraires service</span>
                {rowData.horraires_services}
            </>
        );
    };

    const imageBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                {rowData.image_name}
            </>
        );
    };

    const descriptionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                {rowData.description}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => editEmploye(rowData)} />
                <Button icon="pi pi-trash" severity="warning" rounded onClick={() => confirmDeleteEmploye(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestion employes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const employeDialogFooter = (employe) => (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={() => saveEmploye(employe)} />
        </>
    );

    const deleteEmployeDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteEmployeDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={() => deleteEmploye(employe)} />
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
                        value={employes}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Afficher de {first} à {last} sur {totalRecords} employés"
                        globalFilter={globalFilter}
                        emptyMessage="Aucun employé trouvé."
                        header={header}
                    >
                        <Column field="id" header="ID" sortable body={idBodyTemplate}></Column>
                        <Column field="etablissement_id" header="Etablissement" sortable body={idEtablissementBodyTemplate}></Column>
                        <Column field="nom" header="Nom" sortable body={nomBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="prenom" header="Prénom" sortable body={prenomBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="horraires_service" header="Horraires service" sortable body={horrairesBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="image_name" header="Image" sortable body={imageBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="description" header="Description" sortable body={descriptionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={employeDialog} style={{ width: '450px' }} header="Gestion employés" modal className="p-fluid" footer={employeDialogFooter(employe)} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nom">Nom</label>
                            <InputText id="nom" value={employe.nom} onChange={(e) => onInputChange(e, 'nom')} required autoFocus className={classNames({ 'p-invalid': submitted && !employe.nom })} />
                            {submitted && !employe.nom && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="prenom">Prénom</label>
                            <InputText id="prenom" value={employe.prenom} onChange={(e) => onInputChange(e, 'prenom')} required className={classNames({ 'p-invalid': submitted && !employe.prenom })} />
                            {submitted && !employe.prenom && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="horraires_service">Horraires service</label>
                            <InputText id="horraires_service" value={employe.horraires_service} onChange={(e) => onInputChange(e, 'horraires_service')} required className={classNames({ 'p-invalid': submitted && !employe.horraires_service })} />
                            {submitted && !employe.horraires_service && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="image_name">Image</label>
                            <InputText id="image_name" value={employe.image_name} onChange={(e) => onInputChange(e, 'image_name')} required className={classNames({ 'p-invalid': submitted && !employe.image_name })} />
                            {submitted && !employe.image_name && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="description">Description</label>
                            <InputText id="description" value={employe.horraires_service} onChange={(e) => onInputChange(e, 'description')} required className={classNames({ 'p-invalid': submitted && !employe.description })} />
                            {submitted && !employe.description && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>

                        
                    </Dialog>

                    <Dialog visible={deleteEmployeDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteEmployeDialogFooter} onHide={hideDeleteEmployeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {employe && (
                                <span>
                                    Etes vous sûr de vouloir supprimer <b>{employe.nom} {employe.prenom}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CrudEmploye;
