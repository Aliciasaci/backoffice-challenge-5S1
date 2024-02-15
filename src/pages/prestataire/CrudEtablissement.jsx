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
import { ToggleButton } from 'primereact/togglebutton';
import TimeRangePicker from '../../components/TimeRangePicker';
import MapFinder from '../../components/MapFinder';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';

const CrudEtablissement = () => {
    let emptyEtablissement = {
        id: null,
        prestataire: null,
        nom: '',
        adresse: '',
        kbis: null,
        validation: false,
        horaires_ouverture: {
            lundi: { checked: false, timeRange: { startTime: '', endTime: '' } },
            mardi: { checked: false, timeRange: { startTime: '', endTime: '' } },
            mercredi: { checked: false, timeRange: { startTime: '', endTime: '' } },
            jeudi: { checked: false, timeRange: { startTime: '', endTime: '' } },
            vendredi: { checked: false, timeRange: { startTime: '', endTime: '' } },
            samedi: { checked: false, timeRange: { startTime: '', endTime: '' } },
            dimanche: { checked: false, timeRange: { startTime: '', endTime: '' } },
        },
        ville: '',
        codePostal: '',
    };

    const { auth } = useAuth();
    const id = auth?.userId;

    const axiosPrivate = useAxiosPrivate();

    const [etablissements, setEtablissements] = useState([]);
    const [etablissementDialog, setEtablissementDialog] = useState(false);
    const [deleteEtablissementDialog, setDeleteEtablissementDialog] = useState(false);
    const [etablissement, setEtablissement] = useState(emptyEtablissement);
    const [prestataire, setPrestataire] = useState(''); 
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const [kbis, setKbis] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('');
    const toast = useRef(null);
    const dt = useRef(null);

    const editEtablissement = async (etablissement) => {
        setEtablissement({...etablissement, 
            id: etablissement['@id'].split('/')[3],
            prestataire: etablissement['prestataire']['@id'],
            nom: etablissement['nom'],
            adresse: etablissement['adresse'],
            validation: etablissement['validation'],
            horaires_ouverture: JSON.parse(etablissement['horairesOuverture']),
        });
        setIsPosting(false);
        // setEtablissement({ ...etablissement });
        setEtablissementDialog(true);
    };

    const handleAddressChange = (newAddress) => {
        setSelectedAddress(newAddress.formatted_address);
        setLatitude(newAddress.lat);
        setLongitude(newAddress.lng);
    };

    useEffect(() => {
        const parts = selectedAddress.split(',');
        if (parts.length > 1) {
            const secondPart = parts[1].trim(); // "45000 Orléans"
            const thirdPart = parts[2].trim();
            const [code, ...cityParts] = secondPart.split(' ');
            setEtablissement({ ...etablissement, adresse: parts[0], codePostal: code, ville: cityParts.join(' ').trim(), pays: thirdPart });
        } 
    }, [selectedAddress, etablissement]);
    

    useEffect(() => {
        const fetchEtablissements = async () => {
            try {
                const response = await axiosPrivate.get(`/prestataires/${id}/etablissements`);
                const data = response['data']['hydra:member'];
                setEtablissements(data);
                setPrestataire(data[0]['prestataire']['@id']);
            } catch (error) {
                console.log("error", error);
            }
        }

        fetchEtablissements();
    }, []);

    const openNew = () => {
        setEtablissement(emptyEtablissement);
        setIsPosting(true);
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
                const response = await axiosPrivate.patch(`/etablissements/${etablissement.id}`, {
                    prestataire: null,
                    nom: etablissement.nom,
                    adresse: etablissement.adresse,
                    kbis: etablissement.kbis,
                    validation: etablissement.validation,
                    horairesOuverture: JSON.stringify(etablissement.horaires_ouverture),
                    latitude: latitude,
                    longitude: longitude,
                    ville: etablissement.ville,
                    codePostal: etablissement.codePostal,
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
                let content = new FormData();
                content.append("nom", etablissement.nom);
                content.append("adresse", etablissement.adresse);
                content.append("horairesOuverture", `"${JSON.stringify(etablissement.horaires_ouverture)}"` ); 
                content.append("prestataire", prestataire);
                content.append("latitude", latitude);  
                content.append("longitude", longitude);
                content.append("ville", etablissement.ville);
                content.append("kbisFile", kbis);
                content.append("codePostal", etablissement.codePostal);
                try {
                    const response = await axiosPrivate.post(`/etablissements`, content, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
        
                    if (response.status >= 200 && response.status < 300) {
                        _etablissement = response['data'];
                        _etablissements.push(_etablissement);
        
                        toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Etablissement crée', life: 3000 });
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Etablissement non crée', life: 3000 });
                    }
        
                } catch (error) {
                    console.error('Error:', error);
                }
                
            }

            setEtablissements(_etablissements);
            setEtablissementDialog(false);
            setEtablissement(emptyEtablissement);
        }
    };

    const handleTimeRangeChange = (timeRange, day) => {
        setEtablissement(prevState => ({
            ...prevState,
            horaires_ouverture: {
                ...prevState.horaires_ouverture,
                [day]: {
                    ...prevState.horaires_ouverture[day],
                    timeRange: timeRange
                }
            }
        }));
    };

    const handleToggleChange = (day) => {
        setEtablissement(prevState => ({
            ...prevState,
            horaires_ouverture: {
                ...prevState.horaires_ouverture,
                [day]: {
                    ...prevState.horaires_ouverture[day],
                    checked: !prevState.horaires_ouverture[day].checked,
                    timeRange: (prevState.horaires_ouverture[day].timeRange.startTime !== ''
                        ? prevState.horaires_ouverture[day].timeRange
                        : { startTime: '09:00', endTime: '19:00' })
                }
            }
        }));
    }

    const confirmDeleteEtablissement = (etablissement) => {
        setEtablissement(etablissement);
        setDeleteEtablissementDialog(true);
    };

    const deleteEtablissement = async (etablissement) => {
        const response = axiosPrivate.delete(`/etablissements/${etablissement.id}`);
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
                <Badge size="large" value={rowData.validation === false ? "En attente" : "Validé"} severity={rowData.validation === false ? "warning" : rowData.validation === true ? "success" : "danger"} />
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
            <h5 className="m-0">Gestion établissements</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const etablissementDialogFooter = (etablissement) => (
        <>
            <Button label="Annuler" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Valider" icon="pi pi-check" text onClick={() => saveEtablissement(etablissement)} />
        </>
    );

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setKbis(event.target.files[0]);
        }
    };

    const deleteEtablissementDialogFooter = (
        <>
            <Button label="Non" icon="pi pi-times" text onClick={hideDeleteEtablissementDialog} />
            <Button label="Oui" icon="pi pi-check" text onClick={() => deleteEtablissement(etablissement)} />
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
                        {/* <Column field="horaires_ouverture" header="Horraires ouverture" sortable body={horrairesBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column> */}
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={etablissementDialog} style={{ width: '800px' }} header="Gestion etablissements" modal className="p-fluid" footer={etablissementDialogFooter(etablissement)} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nom">Nom</label>
                            <InputText id="nom" value={etablissement.nom} onChange={(e) => onInputChange(e, 'nom')} required autoFocus className={classNames({ 'p-invalid': submitted && !etablissement.nom })} />
                            {submitted && !etablissement.nom && <small className="p-invalid">Champ obligatoire.</small>}
                        </div>
                        <div className="field">
                            {isPosting && (
                                <>
                                    <label htmlFor="kbis" className=' mt-2'>Kbis</label>
                                    <Toast ref={toast}></Toast>
                                    <input className='ml-4' type="file" id="file-upload" name="file-upload" onChange={handleFileChange} />
                                </>
                            )}
                        </div>
                        <div className="field">
                            <label htmlFor="adresse">Adresse</label>
                            {
                                etablissementDialog && (
                                    <>
                                        {submitted && !etablissement.adresse && <small className="p-invalid">Champ obligatoire.</small>}
                                        <MapFinder onAddressSelect={handleAddressChange}/>
                                    </>
                                )
                            }
                            
                        </div>
                        <div className="field">
                            <label htmlFor="horaires_ouverture">Horraires d&apos;ouverture</label>
                                {/* <InputText id="horaires_ouverture" value={etablissement.horaires_ouverture} onChange={(e) => onInputChange(e, 'horaires_ouverture')} required className={classNames({ 'p-invalid': submitted && !etablissement.horaires_ouverture })} />
                                {submitted && !etablissement.horaires_ouverture && <small className="p-invalid">Champ obligatoire.</small>} */}
                                <div className='grid'>
                                    <div className='col-12'>
                                        <div className='card'>
                                            {Object.entries(etablissement.horaires_ouverture).map(([day, value]) => (
                                                <div key={day} className="flex mb-3 justify-center" style={{ width: '100%', justifyContent: 'space-evenly' }}>
                                                    <ToggleButton
                                                        style={{ width: '125px' }}
                                                        checked={value.checked}
                                                        onLabel={day.charAt(0).toUpperCase() + day.slice(1)}
                                                        offLabel={day.charAt(0).toUpperCase() + day.slice(1)}
                                                        onChange={() => handleToggleChange(day)}
                                                    />
                                                    <div className='flex w-4/5 max-w-xs justify-center' style={{ width: '385px', justifyContent: 'center', alignItems: 'center' }}>
                                                        {value.checked ? (
                                                            <TimeRangePicker
                                                                show={value.checked}
                                                                day={day}
                                                                onTimeRangeChange={(timeRange, selectedDay) => handleTimeRangeChange(timeRange, selectedDay)}
                                                            />
                                                        ) : (
                                                            <span className='text-xl text-black font-bold'>Fermé</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </Dialog>

                    <Dialog visible={deleteEtablissementDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteEtablissementDialogFooter} onHide={hideDeleteEtablissementDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {etablissement && (
                                <span>
                                    Etes vous sûr de vouloir supprimer <b>{etablissement.nom}</b> ?
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
