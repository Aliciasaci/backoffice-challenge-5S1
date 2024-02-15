import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { ProgressSpinner } from "primereact/progressspinner";

const PrestataireDashboard = () => {
  const [nbEtablissements, setNbEtablissements] = useState(0);
  const [nbEmployes, setNbEmployes] = useState(0);
  const [nbPrestations, setNbPrestations] = useState(0);
  const [nbReservations, setNbReservations] = useState(0);
  const [nbDataLine, setNbDataLine] = useState([]);
  const [nbDataLine2, setNbDataLine2] = useState([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  const { auth } = useAuth();
  const id = auth?.userId;

  const axiosPrivate = useAxiosPrivate();

  const lineData = {
    labels: ["Janvier", "Février", "Mars", "Avril", "Mai", "June", "Juillet"],
    datasets: [
      {
        label: "Réservations effectuées",
        data: nbDataLine,
        fill: false,
        borderColor: "#007bff",
      },
      {
        label: "Réservations annulées",
        data: nbDataLine2,
        fill: false,
        borderColor: "#dc3545",
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
        const response = await axiosPrivate.get(
          `/prestataires/${id}/etablissements`
        );
        const data = response["data"]["hydra:member"];
        for (let i = 0; i < data.length; i++) {
          const responseEmploye = await axiosPrivate.get(
            `/etablissements/${data[i].id}/employes`
          );
          const dataEmploye = responseEmploye["data"]["hydra:member"];
          setNbEmployes(nbEmployes + dataEmploye.length);

          const responsePrestation = await axiosPrivate.get(
            `/etablissements/${data[i].id}/prestations`
          );
          const dataPrestation = responsePrestation["data"]["hydra:member"];
          setNbPrestations(nbPrestations + dataPrestation.length);

          const responseReservation = await axiosPrivate.get(
            `/etablissements/${data[i].id}/reservations`
          );
          const dataReservation = responseReservation["data"]["hydra:member"];
          setNbReservations(nbReservations + dataReservation.length);
        }

        setNbEtablissements(data.length);

        chart(data);
      } catch (error) {
        console.log(error);
      }
    };

    const chart = async (listEtab) => {
      let chartData = JSON.parse(localStorage.getItem("chartData")) || {
        dataReservationsByMonth: [],
        dataReservationsCanceledByMonth: [],
      };
      if (
        chartData.dataReservationsByMonth.length === 0 ||
        chartData.dataReservationsCanceledByMonth.length === 0
      ) {
        setIsChartLoading(true);
        for (let i = 1; i <= 7; i++) {
          for (let k = 0; k < listEtab.length; k++) {
            const nbReservationsByMonth = await countReservationsByMonth(
              i,
              listEtab[k].id
            );
            chartData.dataReservationsByMonth.push(nbReservationsByMonth);

            const nbReservationsCanceledByMonth =
              await countReservationsCanceledByMonth(i, listEtab[k].id);
            chartData.dataReservationsCanceledByMonth.push(
              nbReservationsCanceledByMonth
            );
          }
        }
        localStorage.setItem("chartData", JSON.stringify(chartData));
        setIsChartLoading(false);
      }
      setNbDataLine(chartData.dataReservationsByMonth);
      setNbDataLine2(chartData.dataReservationsCanceledByMonth);
    };

    countEtablissements();
  }, []);

  const countReservationsByMonth = async (month, id) => {
    try {
      const response = await axiosPrivate.get(
        `/etablissements/${id}/reservations?month=${month}`
      );
      const data = response["data"]["hydra:member"];
      return data.length;
    } catch (error) {
      console.log(error);
    }
  };

  const countReservationsCanceledByMonth = async (month, id) => {
    try {
      const response = await axiosPrivate.get(
        `/etablissements/${id}/reservations?month=${month}&status=canceled`
      );
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
              <span className="block text-500 font-medium mb-3">Employés</span>
              <div className="text-900 font-medium text-xl">{nbEmployes}</div>
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
      <div className="col-12 lg:col-6 xl:col-3">
        <div className="card mb-0">
          <div className="flex justify-content-between mb-3">
            <div>
              <span className="block text-500 font-medium mb-3">
                Réservations
              </span>
              <div className="text-900 font-medium text-xl">
                {nbReservations}
              </div>
            </div>
            <div
              className="flex align-items-center justify-content-center bg-purple-100 border-round"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="pi pi-shopping-cart text-purple-500 text-xl" />
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
          <h5>Stats réservations</h5>
          {isChartLoading ? (
            <div className="flex align-items-center justify-content-center">
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
            </div>
          ) : (
            <Chart type="line" data={lineData} options={lineOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrestataireDashboard;
