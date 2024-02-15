import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AdminDashboard = () => {
  const [nbEtablissements, setNbEtablissements] = useState(0);
  const [nbUsers, setNbUsers] = useState(0);
  const [nbPrestataires, setNbPrestataires] = useState(0);
  const [nbPrestations, setNbPrestations] = useState(0);
  const [nbDataLine, setNbDataLine] = useState([]);

  const axiosPrivate = useAxiosPrivate();

  const lineData = {
    labels: ["Janvier", "Février", "Mars", "Avril", "Mai", "June", "Juillet"],
    datasets: [
      {
        label: "Utlisateurs crées",
        data: nbDataLine,
        fill: false,
        borderColor: "#007bff",
      },
    ],
  };

  const lineOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#495057",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
      y: {
        ticks: {
          color: "#495057",
        },
        grid: {
          color: "#ebedef",
        },
      },
    },
  };

  useEffect(() => {
    const countEtablissements = async () => {
      try {
        const response = await axiosPrivate.get("/etablissements/");
        const data = response["data"]["hydra:member"];
        setNbEtablissements(data.length);
      } catch (error) {
        console.log(error);
      }
    };

    const countUsers = async () => {
      try {
        const response = await axiosPrivate.get("/users?roles=ROLE_USER");
        const data = response["data"]["hydra:member"];
        setNbUsers(data.length);
      } catch (error) {
        console.log(error);
      }
    };

    const countPrestataires = async () => {
      try {
        const response = await axiosPrivate.get(
          "/users?roles=ROLE_PRESTATAIRE"
        );
        const data = response["data"]["hydra:member"];
        setNbPrestataires(data.length);
      } catch (error) {
        console.log(error);
      }
    };

    const countPrestations = async () => {
      try {
        const response = await axiosPrivate.get("/prestations/");
        const data = response["data"]["hydra:member"];
        setNbPrestations(data.length);
      } catch (error) {
        console.log(error);
      }
    };

    const chart = async () => {
      let dataUsersCreatedByMonth = [];
      for (let i = 1; i <= 7; i++) {
        const nbUsersCreatedByMonth = await countUsersCreatedByMonth(i);
        dataUsersCreatedByMonth.push(nbUsersCreatedByMonth);
      }
      setNbDataLine(dataUsersCreatedByMonth);
    };

    countEtablissements();
    countUsers();
    countPrestataires();
    countPrestations();
    chart();
  }, []);

  const countUsersCreatedByMonth = async (month) => {
    try {
      const response = await axiosPrivate.get(`/users?month=${month}`);
      const data = response["data"]["hydra:member"];
      return data.length;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="grid">
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Etablissements
              </span>
              <div className="text-900 font-medium text-xl">
                {nbEtablissements}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-blue-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-building text-blue-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium"></span>
          <span className="text-500"></span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Utilisateurs
              </span>
              <div className="text-900 font-medium text-xl">{nbUsers}</div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-user text-orange-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium"></span>
          <span className="text-500"></span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Prestataires
              </span>
              <div className="text-900 font-medium text-xl">
                {nbPrestataires}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-orange-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-user text-orange-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium"></span>
          <span className="text-500"></span>
        </div>
      </div>
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Prestations
              </span>
              <div className="text-900 font-medium text-xl">
                {nbPrestations}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-cyan-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-inbox text-cyan-500 text-xl" />
            </div>
          </div>
          <span className="text-green-500 font-medium"></span>
          <span className="text-500"></span>
        </div>
      </div>

      <div className="col-12 xl:col-6">
        <div className="card">
          <div className="flex align-items-center justify-content-between mb-4">
            <h5>Notifications</h5>
          </div>
        </div>
      </div>

      <div className="col-12 xl:col-6">
        <div className="card">
          <h5>Stat utilisateurs</h5>
          <Chart type="line" data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
