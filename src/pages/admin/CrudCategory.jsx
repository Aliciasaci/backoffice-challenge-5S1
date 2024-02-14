import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { useEffect, useRef, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';


const CrudCategory = () => {
    let emptyCategory = {
        id: null,
        name: '',
    };

    const axiosPrivate = useAxiosPrivate();

    const [categories, setCategories] = useState([]);
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(false);
    const [category, setCategory] = useState(emptyCategory);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosPrivate.get('/categories');
                const data = response['data']['hydra:member'];
                setCategories(data);
            } catch (error) {
                console.log("error", error);
            }
        }

        fetchCategories();
    }, []);

    const openNew = () => {
        setCategory(emptyCategory);
        setSubmitted(false);
        setCategoryDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCategoryDialog(false);
    };

    const hideDeleteCategoryDialog = () => {
        setDeleteCategoryDialog(false);
    };

    const saveCategory = async (category) => {
        setSubmitted(true);
        if (category.name.trim()) {
            let _categories = [...categories];
            let _category = { ...category };
            if (category.id) {
                const response = await axiosPrivate.patch(`/categories/${category.id}`, {
                    name: category.name,
                },
                {
                    headers: {
                        'Content-Type': 'application/merge-patch+json',
                    },
                });
                _category = response['data'];
                _categories[_categories.findIndex((el) => el.id === category.id)] = _category;

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Catégorie modifiée', life: 3000 });
            } else {
                const response = await axiosPrivate.post('/categories', {
                    name: category.name,
                });
                _category = response['data'];
                _categories.push(_category);

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Catégorie crée', life: 3000 });
            }

            setCategories(_categories);
            setCategoryDialog(false);
            setCategory(emptyCategory);
        }
    };

    const editCategory = async (category) => {
        setCategory({ ...category });
        setCategoryDialog(true);
    };

    const confirmDeleteCategory = (category) => {
        setCategory(category);
        setDeleteCategoryDialog(true);
    };

    const deleteCategory = async (category) => {
        const response = await axiosPrivate.delete(`/categories/${category.id}`);
        let _categories = categories.filter((val) => val.id !== category.id);
        setCategories(_categories);
        setDeleteCategoryDialog(false);
        setCategory(emptyCategory);
        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Utilisateur supprimé', life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _category = { ...category };
        _category[`${name}`] = val;

        setCategory(_category);
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
                {rowData.name}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => editCategory(rowData)} />
                <Button icon="pi pi-trash" severity="warning" rounded onClick={() => confirmDeleteCategory(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestion catégories</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const categoryDialogFooter = (category) => (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={() => saveCategory(category)} />
        </>
    );

    const deleteCategoryDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteCategoryDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={() => deleteCategory(category)} />
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
                        value={categories}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Afficher de {first} à {last} sur {totalRecords} utilisateurs"
                        globalFilter={globalFilter}
                        emptyMessage="Aucune catégorie trouvée."
                        header={header}
                    >
                        <Column field="id" header="ID" sortable body={idBodyTemplate}></Column>
                        <Column field="name" header="Nom" sortable body={nomBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={categoryDialog} style={{ width: '450px' }} header="Gestion catégories" modal className="p-fluid" footer={categoryDialogFooter(category)} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="name">Nom</label>
                            <InputText id="name" value={category.name} onChange={(e) => onInputChange(e, 'name')} required autoFocus className={classNames({ 'p-invalid': submitted && !category.name })} />
                            {submitted && !category.name && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCategoryDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCategoryDialogFooter} onHide={hideDeleteCategoryDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {category && (
                                <span>
                                    Etes vous sûr de vouloir supprimer <b>{category.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CrudCategory;
