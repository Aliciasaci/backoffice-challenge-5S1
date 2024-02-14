import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { useEffect, useRef, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import axios from 'axios';

const CrudUser = () => {
    let emptyUser = {
        id: null,
        nom: '',
        prenom: '',
        email: '',
        roles: null,
        password: '',
    };

    const axiosPrivate = useAxiosPrivate();

    const [users, setUsers] = useState([]);
    const [userDialog, setUserDialog] = useState(false);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const [submitted, setSubmitted] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/users');
                const data = response['data']['hydra:member'];
                setUsers(data);
            } catch (error) {
                console.log("error", error);
            }
        }

        fetchUsers();
    }, []);

    const openNew = () => {
        setUser(emptyUser);
        setSubmitted(false);
        setUserDialog(true);
        setIsEdit(false);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
        setIsEdit(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const saveUser = async (user) => {
        setSubmitted(true);
        setIsEdit(false);
        user.roles = [user.roles];
        if (user.nom.trim()) {
            let _users = [...users];
            let _user = { ...user };
            if (user.id) {
                const response = await axios.patch(`/users/${user.id}`, {
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    plainPassword: user.password,
                    roles: user.roles,
                },
                {
                    headers: {
                        'Content-Type': 'application/merge-patch+json',
                    },
                });
                _user = response['data'];
                _users[_users.findIndex((el) => el.id === user.id)] = _user;

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Utilisateur modifié', life: 3000 });
            } else {
                const response = await axios.post('/users', {
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    plainPassword: user.password,
                    roles: user.roles,  
                });
                _user = response['data'];
                _users.push(_user);

                toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Utilisateur crée', life: 3000 });
            }

            setUsers(_users);
            setUserDialog(false);
            setUser(emptyUser);
        }
    };

    const editUser = async (user) => {
        setUser({ ...user });
        setUserDialog(true);
        setIsEdit(true);
    };

    const confirmDeleteUser = (user) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const deleteUser = async (user) => {
        const response = axios.delete(`/users/${user.id}`);
        let _users = users.filter((val) => val.id !== user.id);
        setUsers(_users);
        setDeleteUserDialog(false);
        setUser(emptyUser);
        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Utilisateur supprimé', life: 3000 });
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onRoleChange = (e) => {
        let _user = { ...user };
        // role is an array
        let role = [e.value];
        _user['roles'] = role;
        setUser(_user);
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };
        _user[`${name}`] = val;

        setUser(_user);
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


    const prenomBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Prénom</span>
                {rowData.prenom}
            </>
        );
    };

    const emailBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Email</span>
                {rowData.email}
            </>
        );
    };

    const rolesBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Rôles</span>
                {rowData.roles}
            </>
        );
    };

    // const statusBodyTemplate = (rowData) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Status</span>
    //             <span className={`user-badge status-${rowData.inventoryStatus.toLowerCase()}`}>{rowData.inventoryStatus}</span>
    //         </>
    //     );
    // };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" severity="success" rounded className="mr-2" onClick={() => editUser(rowData)} />
                <Button icon="pi pi-trash" severity="warning" rounded onClick={() => confirmDeleteUser(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestion utilisateurs</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const userDialogFooter = (user) => (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={() => saveUser(user)} />
        </>
    );

    const deleteUserDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteUserDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={() => deleteUser(user)} />
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
                        value={users}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Afficher de {first} à {last} sur {totalRecords} utilisateurs"
                        globalFilter={globalFilter}
                        emptyMessage="Aucun utilisateur trouvé."
                        header={header}
                    >
                        <Column field="id" header="ID" sortable body={idBodyTemplate}></Column>
                        <Column field="nom" header="Nom" sortable body={nomBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="prenom" header="Prénom" sortable body={prenomBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="email" header="Email" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="roles" header="Rôles" sortable body={rolesBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={userDialog} style={{ width: '450px' }} header="Gestion utilisateurs" modal className="p-fluid" footer={userDialogFooter(user)} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nom">Nom</label>
                            <InputText id="nom" value={user.nom} onChange={(e) => onInputChange(e, 'nom')} required autoFocus className={classNames({ 'p-invalid': submitted && !user.nom })} />
                            {submitted && !user.nom && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="prenom">Prénom</label>
                            <InputText id="prenom" value={user.prenom} onChange={(e) => onInputChange(e, 'prenom')} required className={classNames({ 'p-invalid': submitted && !user.prenom })} />
                            {submitted && !user.prenom && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText id="email" value={user.email} onChange={(e) => onInputChange(e, 'email')} required className={classNames({ 'p-invalid': submitted && !user.email })} />
                            {submitted && !user.email && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>

                        <div className="field">
                            <label className="mb-3">Rôle</label>
                            <div className="formgrid grid">

                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="role_user" name="role" value="ROLE_USER" onChange={onRoleChange} checked={user.roles && user.roles.indexOf('ROLE_USER')>-1} />
                                    <label htmlFor="role_user">ROLE_USER</label>
                                </div>
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="role_admin" name="role" value="ROLE_ADMIN" onChange={onRoleChange} checked={user.roles && user.roles.indexOf('ROLE_ADMIN')>-1} />
                                    <label htmlFor="role_admin">ROLE_ADMIN</label>
                                </div>
                                <div className="field-radiobutton col-6">
                                    <RadioButton inputId="role_prestataire" name="role" value="ROLE_PRESTATAIRE" onChange={onRoleChange} checked={user.roles && user.roles.indexOf('ROLE_PRESTATAIRE')>-1} />
                                    <label htmlFor="role_prestataire">ROLE_PRESTATAIRE</label>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="password">Mot de passe</label>
                            <Password disabled={isEdit} id="password" value={user.password} onChange={(e) => onInputChange(e, 'password')} required className={classNames({ 'p-invalid': submitted && !user.password })} />
                            {submitted && !user.password && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && (
                                <span>
                                    Etes vous sûr de vouloir supprimer <b>{user.nom} {user.prenom}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CrudUser;
