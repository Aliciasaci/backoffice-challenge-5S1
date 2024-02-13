import React, { useContext } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext.jsx";
import { MenuProvider } from "./context/menucontext";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AppMenu = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const { auth } = useAuth();
  const userRole = auth?.role;
  const model = [
    {
      label: "Accueil",
      items: [{ label: "Tableau de bord", icon: "pi pi-fw pi-home", to: "/" }],
    },
  ];

  // if in the roles array there is a role that is equal to "ROLE_ADMIN" then add the admin gestion menu to the model
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
      ],
    });
  }

  return (
    <MenuProvider>
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
