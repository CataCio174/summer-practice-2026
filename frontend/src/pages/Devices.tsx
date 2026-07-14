import { useState, useEffect, useMemo } from "react";
import {
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import AddDeviceForm from "../components/AddDeviceForm";
import PageHeader from "../components/PageHeader";

type ActionType = "schedule" | "edit" | "remove" | null;

const DeviceTable = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  
  // Stare pentru fereastra de Adăugare/Editare
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices", {
        // Aceste setări obligă browser-ul să ceară mereu date proaspete din baza de date
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleScheduleOpen = (device: any) => {
    setSelectedDevice(device);
    setIsScheduleDialogOpen(true);
    setSelectedAction("schedule");
  };

  const handleScheduleClose = () => {
    setIsScheduleDialogOpen(false);
    setSelectedAction(null);
    setSelectedDevice(null);
  };

  // Funcția de ștergere instantanee
  const handleRemoving = async (id: string) => {
    try {
      const response = await fetch("/api/device/" + id, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.status}`);
      }
      // Reîncărcăm datele de la server pentru a evita ecranul alb
      fetchDevices(); 
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  const handleAction = (action: ActionType, device: any) => {
    switch (action) {
      case "schedule":
        handleScheduleOpen(device);
        break;
      case "edit":
        // Deschidem formularul și setăm dispozitivul curent pentru editare
        setSelectedDevice(device);
        setIsAddDialogOpen(true);
        break;
      case "remove":
        // Ștergem instantaneu folosind ID-ul dispozitivului
        const deviceId = device._id?.$oid || device._id;
        handleRemoving(deviceId);
        break;
      default:
        break;
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "deviceName", header: "Device Name" },
      { accessorKey: "deviceSlNo", header: "Serial Number" },
      { accessorKey: "deviceType", header: "Device Type" },
      { accessorKey: "hwType", header: "Hardware Type" },
      { accessorKey: "site", header: "Site" },
      { accessorKey: "group", header: "Group" },
      { accessorKey: "owner", header: "Owner" },
      {
        id: "connection",
        header: "Connection",
        accessorFn: (row: any) => {
          const type = row.connectivityType || "-";
          const ip = row.ip || "-";
          const port = row.port || "-";
          return `${type} | ${ip}:${port}`;
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: devices,
    enableRowActions: true,
    positionActionsColumn: "last",
    muiTableContainerProps: {},
    muiTablePaperProps: {
      elevation: 0,
    },
    renderTopToolbarCustomActions: () => (
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAddDialogOpen}
      >
        Add Device
      </Button>
    ),
    renderRowActionMenuItems: ({ row, closeMenu }) => [
      <MenuItem
        key="schedule"
        onClick={() => {
          handleAction("schedule", row.original);
          closeMenu();
        }}
        sx={{ py: 1.5, px: 2 }}
      >
        <ListItemIcon>
          <EventIcon fontSize="small" color="primary" />
        </ListItemIcon>
        <ListItemText>Programa</ListItemText>
      </MenuItem>,

      <MenuItem
        key="edit"
        onClick={() => {
          handleAction("edit", row.original);
          closeMenu();
        }}
        sx={{ py: 1.5, px: 2 }}
      >
        <ListItemIcon>
          <EditIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </ListItemIcon>
        <ListItemText>Edita</ListItemText>
      </MenuItem>,

      <MenuItem
        key="remove"
        onClick={() => {
          handleAction("remove", row.original);
          closeMenu();
        }}
        sx={{ py: 1.5, px: 2, color: "error.main" }}
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText>Elimina</ListItemText>
      </MenuItem>,
    ],
  });

  const handlePerformAction = async () => {
    if (!selectedDevice) return;
    try {
      if (selectedAction === "schedule") {
        console.log(`Scheduled action for device ${selectedDevice._id?.$oid || selectedDevice._id}`);
      }
      handleScheduleClose();
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const handleAddDialogOpen = () => {
    setSelectedDevice(null); // Golim formularul pentru o adăugare nouă
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setSelectedDevice(null);
  };

  const handleAddDeviceSuccess = () => {
    fetchDevices();
  };

  return (
    <Container maxWidth={false} disableGutters>
      <PageHeader title="Devices" breadcrumbItems={["Home", "Devices"]} />
      <MaterialReactTable table={table} />
      
      {/* Dialog Schedule */}
      <Dialog open={isScheduleDialogOpen} onClose={handleScheduleClose}>
        <DialogTitle>Schedule Action</DialogTitle>
        <DialogContent>
          Schedule dialog content...
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleClose}>Cancel</Button>
          <Button onClick={handlePerformAction} color="primary">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formular Adăugare / Editare */}
      <AddDeviceForm
        open={isAddDialogOpen}
        onClose={handleAddDialogClose}
        onSuccess={handleAddDeviceSuccess}
        device={selectedDevice} // Trimitem datele către formularul de editare
      />
    </Container>
  );
};

export default DeviceTable;