import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const CrudPrestation = () => {
    let emptyPrestation = {
        id: null,
        titre: '',
        duree: '',
        prix: '',
        description: '',
        category: null,
        etablissement: null,
    };

    const [prestations, setPrestations] = useState([]);
    const [prestationDialog, setPrestationDialog] = useState(false);
    const [deletePrestationDialog, setDeletePrestationDialog] = useState(false);
    const [prestation, setPrestation] = useState(emptyPrestation);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [etablissements, setEtablissements] = useState([]);
    const [selectedEtablissement, setSelectedEtablissement] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchPrestations = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/prestations');
                const data = response['data']['hydra:member'];
                setPrestations(data);
            } catch (error) {
                console.log("error", error);
            }
        }
        
        fetchPrestations();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/categories');
            const data = response['data']['hydra:member'];
            setCategories(data);
        } catch (error) {
            console.log("error", error);
        }
    }

    const fetchEtablissements = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/etablissements');
            const data = response['data']['hydra:member'];
            setEtablissements(data);
        } catch (error) {
            console.log("error", error);
        }
    }

    const openNew = () => {
        setPrestation(emptyPrestation);
        setSubmitted(false);
        setPrestationDialog(true);
        fetchCategories();
        fetchEtablissements();
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPrestationDialog(false);
    };

    const hideDeletePrestationDialog = () => {
        setDeletePrestationDialog(false);
    };

    const savePrestation = async (prestation) => {
        setSubmitted(true);
        if (prestation.titre.trim()) {
            let _prestations = [...prestations];
            let _prestation = { ...prestation };
            if (prestation.id) {
                const response = await axios.patch(`http://localhost:8000/api/prestations/${prestation.id}`, {
                    titre: prestation.titre,
                    duree: prestation.duree,
                    prix: prestation.prix,
                    description: prestation.description,
                    category: selectedCategory,
                    etablissement: selectedEtablissement,
                },
                {
                    headers: {
                        'Content-Type': 'application/merge-patch+json',
                    },
                });
                _prestation = response['data'];
                _prestations[_prestations.findIndex((el) => el.id === prestation.id)] = _prestation;

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Prestation modifiée', life: 3000 });
            } else {
                const response = await axios.post('http://localhost:8000/api/prestations', {
                    titre: prestation.titre,
                    duree: prestation.duree,
                    prix: prestation.prix,
                    description: prestation.description,
                    category: selectedCategory,
                    etablissement: selectedEtablissement,  
                });
                _prestation = response['data'];
                console.log("_prestation", _prestation);
                _prestations.push(_prestation);

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Prestation créée', life: 3000 });
            }

            setPrestations(_prestations);
            setPrestationDialog(false);
            setPrestation(emptyPrestation);
        }
    };

    const editPrestation = async (prestation) => {
        fetchCategories();
        fetchEtablissements();
        setPrestation({ ...prestation });
        setPrestationDialog(true);
        if (prestation.category) {
            let cat = categories.find((el) => el.name === prestation.category.name);
            setSelectedCategory(cat);
        }
        if (prestation.etablissement) {
            let etab = etablissements.find((el) => el.nom === prestation.etablissement.nom);
            setSelectedEtablissement(etab);
        }
    };

    const confirmDeletePrestation = (prestation) => {
        setPrestation(prestation);
        setDeletePrestationDialog(true);
    };

    const deletePrestation = async (prestation) => {
        const response = axios.delete(`http://localhost:8000/api/prestations/${prestation.id}`);
        let _prestations = prestations.filter((val) => val.id !== prestation.id);
        setPrestations(_prestations);
        setDeletePrestationDialog(false);
        setPrestation(emptyPrestation);
        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Prestation supprimée', life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _prestation = { ...prestation };
        _prestation[`${name}`] = val;
        console.log("val", val);
        setPrestation(_prestation);
    };

    const onSelectChange = (e, name) => {
        const val = e.value.id;
        let _prestation = { ...prestation };
        _prestation[`${name}`] = val;
        console.log("val", val);
        setPrestation(_prestation);
        if (name === 'category_id') {
            let cat = categories.find((el) => el.id === val);
            setSelectedCategory(cat);
        } else if (name === 'etablissement_id') {
            let etab = etablissements.find((el) => el.id === val);
            setSelectedEtablissement(etab);
        }
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

    const idCategoryBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Catégorie</span>
                {rowData.category.name}
            </>
        );
    };

    const idEtablissmentBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Etablissement</span>
                {rowData.etablissement.nom}
            </>
        );
    };


    const titreBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Titre</span>
                {rowData.titre}
            </>
        );
    };

    const dureeBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Duree</span>
                {rowData.duree}
            </>
        );
    };

    const prixBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Prix</span>
                {rowData.prix}
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
                <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => editPrestation(rowData)} />
                <Button icon="pi pi-trash" severity="warning" rounded onClick={() => confirmDeletePrestation(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestion prestations</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const prestationDialogFooter = (prestation) => (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={() => savePrestation(prestation)} />
        </>
    );

    const deletePrestationDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeletePrestationDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={() => deletePrestation(prestation)} />
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
                        value={prestations}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Afficher de {first} à {last} sur {totalRecords} prestations"
                        globalFilter={globalFilter}
                        emptyMessage="Aucunne prestation trouvée."
                        header={header}
                    >
                        <Column field="id" header="ID" sortable body={idBodyTemplate}></Column>
                        <Column field="categorie_id" header="Catégorie" sortable body={idCategoryBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="etablissement_id" header="Etablissement" sortable body={idEtablissmentBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="titre" header="Titre" sortable body={titreBodyTemplate} headerStyle={{ minWidth: '20rem' }}></Column>
                        <Column field="duree" header="Durée" sortable body={dureeBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="prix" header="Prix" sortable body={prixBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={prestationDialog} style={{ width: '450px' }} header="Gestion prestations" modal className="p-fluid" footer={prestationDialogFooter(prestation)} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="category_id">Catégorie</label>
                            <Dropdown id="dropdown" options={categories} value={selectedCategory} onChange={(e) => onSelectChange(e, 'category_id')} optionLabel="name"></Dropdown>
                            {/* {submitted && !prestation.category_id && <small className="p-invalid">Champ obligatoire.</small>} */}
                        </div>
                        <div className="field">
                            <label htmlFor="etablissement_id">Etablissement</label>
                            <Dropdown id="dropdown" options={etablissements} value={selectedEtablissement} onChange={(e) => onSelectChange(e, 'etablissement_id')} optionLabel="nom"></Dropdown>
                            {/* {submitted && !prestation.etablissement_id && <small className="p-invalid">Champ obligatoire.</small>} */}
                        </div>
                        <div className="field">
                            <label htmlFor="titre">Titre</label>
                            <InputText id="titre" value={prestation.titre} onChange={(e) => onInputChange(e, 'titre')} required className={classNames({ 'p-invalid': submitted && !prestation.duree })} />
                            {submitted && !prestation.titre && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="duree">Durée</label>
                            <InputText id="duree" value={prestation.duree} onChange={(e) => onInputChange(e, 'duree')} required className={classNames({ 'p-invalid': submitted && !prestation.duree })} />
                            {submitted && !prestation.duree && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="prix">Prix</label>
                            <InputText id="prix" value={prestation.prix} onChange={(e) => onInputChange(e, 'prix')} required className={classNames({ 'p-invalid': submitted && !prestation.prix })} />
                            {submitted && !prestation.prix && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" value={prestation.description} rows={5} onChange={(e) => onInputChange(e, 'description')} required className={classNames({ 'p-invalid': submitted && !prestation.description })} />
                            {submitted && !prestation.description && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePrestationDialog} style={{ width: '450px' }} header="Confirm" modal footer={deletePrestationDialogFooter} onHide={hideDeletePrestationDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {prestation && (
                                <span>
                                    Etes vous sûr de vouloir supprimer <b>{prestation.titre}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CrudPrestation;
