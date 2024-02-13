import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { Link } from 'react-router-dom';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model = [
        {
            label: 'Accueil',
            items: [
                { label: 'Tableau de bord - Admin', icon: 'pi pi-fw pi-home', to: '/admin/dashboard' },
                { label: 'Tableau de bord - Prestataire', icon: 'pi pi-fw pi-home', to: '/prestataire/dashboard' }
            ]
        },
        {
            label: 'Admin Gestion',
            items: [
                { label: 'Utilisateurs', icon: 'pi pi-fw pi-table', to: '/admin/users' },
                { label: 'Etablissements', icon: 'pi pi-fw pi-table', to: '/admin/etablissements' },
                { label: 'Catégories', icon: 'pi pi-fw pi-table', to: '/admin/categories' },
                { label: 'Demandes Prestataire', icon: 'pi pi-fw pi-table', to: '/admin/demandes' },
                {
                    label: 'Auth',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Login',
                            icon: 'pi pi-fw pi-sign-in',
                            to: '/auth/login'
                        },
                        {
                            label: 'Error',
                            icon: 'pi pi-fw pi-times-circle',
                            to: '/auth/error'
                        },
                        {
                            label: 'Access Denied',
                            icon: 'pi pi-fw pi-lock',
                            to: '/auth/access'
                        }
                    ]
                },
                {
                    label: 'Timeline',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/pages/timeline'
                },
            ]
        },
        {
            label: 'Prestataire Gestion',
            items: [
                { label: 'Employes', icon: 'pi pi-fw pi-table', to: '/prestataire/employes' },
                { label: 'Etablissements', icon: 'pi pi-fw pi-table', to: '/prestataire/etablissements' },
                { label: 'Prestations', icon: 'pi pi-fw pi-table', to: '/prestataire/prestations' },
                { label: 'Historique Réservations', icon: 'pi pi-fw pi-table', to: '/prestataire/historique-reservations' },
            ]
        },
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
