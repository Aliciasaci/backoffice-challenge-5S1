import React, { useContext } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext.jsx";
import { MenuProvider } from "./context/menucontext";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Divider } from "primereact/divider";

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const { auth } = useAuth();
  const userRole = auth?.role;
  const model = [
    {
      label: "Accueil",
      items: [
        {
          label: "Tableau de bord",
          icon: "pi pi-fw pi-home",
          to: "/",
        },
      ],
    },
  ];

  if (userRole && userRole.includes("ROLE_ADMIN")) {
    model.push({
      label: "Admin Gestion",
      items: [
        {
          label: "Utilisateurs",
          icon: "pi pi-fw pi-table",
          to: "/admin/users",
        },
        {
          label: "Etablissements",
          icon: "pi pi-fw pi-table",
          to: "/admin/etablissements",
        },
        {
          label: "Catégories",
          icon: "pi pi-fw pi-table",
          to: "/admin/categories",
        },
        {
          label: "Demandes Prestataire",
          icon: "pi pi-fw pi-table",
          to: "/admin/demandes",
        },
      ],
    });
  } else if (userRole && userRole.includes("ROLE_PRESTATAIRE")) {
    model.push({
      label: "Prestataire Gestion",
      items: [
        {
          label: "Employes",
          icon: "pi pi-fw pi-table",
          to: "/prestataire/employes",
        },
        {
          label: "Etablissements",
          icon: "pi pi-fw pi-table",
          to: "/prestataire/etablissements",
        },
        {
          label: "Prestations",
          icon: "pi pi-fw pi-table",
          to: "/prestataire/prestations",
        },
        {
          label: "Historique Réservations",
          icon: "pi pi-fw pi-table",
          to: "/prestataire/reservations",
        },
      ],
    });
  }

  return (
    <MenuProvider>
      <span
        style={{
          fontSize: "20px",
          color: "#8B5CF6",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Bienvenue {auth?.nom} !
      </span>
      <Divider />
      <ul className="layout-menu">
        {model.map((item, i) => {
          return !item.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator"></li>
          );
        })}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
