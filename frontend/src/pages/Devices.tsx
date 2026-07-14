import { useState, useEffect, useMemo } from "react";
import {
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Container,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import DeviceForm from "../components/DeviceForm";
import PageHeader from "../components/PageHeader";
import { Device } from "../types/devices.types";

type ActionType = "schedule" | "edit" | "remove" | null;

const DeviceTable = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices");
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

  const handleScheduleOpen = (device: Device) => {
    setSelectedDevice(device);
    setIsScheduleDialogOpen(true);
    setSelectedAction("schedule");
  };

  const handleScheduleClose = () => {
    setIsScheduleDialogOpen(false);
    setSelectedAction(null);
    setSelectedDevice(null);
  };

  const handleConfirmRemove = async () => {
    if (!deviceToDelete) return;
    await handleRemove(deviceToDelete._id.$oid);
    setDeviceToDelete(null);
  };

  const handleCancelRemove = () => {
    setDeviceToDelete(null);
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch("/api/device/" + id, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }
      await response.json();
      setDevices(devices.filter((device) => device._id.$oid !== id));
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleStartEdit = (device: Device) => {
    setEditingDevice(device);
    setIsAddDialogOpen(true);
  };

  const handleAction = (action: ActionType, device: Device) => {
    switch (action) {
      case "schedule":
        handleScheduleOpen(device);
        break;
      case "edit":
        handleStartEdit(device);
        break;
      case "remove":
        setDeviceToDelete(device);
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
        accessorFn: (row) => {
          const type = row.connectivityType || "-";
          const ip = row.ip || "-";
          const port = row.port || "-";
          return `${type} | ${ip}:${port}`;
        },
      },
    ],
    [],
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
      >
        Schedule
      </MenuItem>,
      <MenuItem
        key="edit"
        onClick={() => {
          handleAction("edit", row.original);
          closeMenu();
        }}
      >
        Edit
      </MenuItem>,
      <MenuItem
        key="remove"
        onClick={() => {
          handleAction("remove", row.original);
          closeMenu();
        }}
      >
        Remove
      </MenuItem>,
    ],
  });

  const handlePerformAction = async () => {
    if (!selectedDevice) return;
    try {
      switch (selectedAction) {
        case "schedule":
          // Perform schedule action with selectedDevice._id
          console.log(`Scheduled action for device ${selectedDevice._id}`);
          break;
        case "edit":
          // Perform edit action with selectedDevice._id
          break;
        case "remove":
          // Perform remove action with selectedDevice._id
          break;
        default:
          break;
      }
      handleScheduleClose();
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const handleAddDialogOpen = () => {
    setEditingDevice(null);
    setIsAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingDevice(null);
  };

  const handleAddDeviceSuccess = () => {
    fetchDevices();
  };

  return (
    <Container maxWidth={false} disableGutters>
      <PageHeader title="Devices" breadcrumbItems={["Home", "Devices"]} />
      <MaterialReactTable table={table} />
      <Dialog open={isScheduleDialogOpen} onClose={handleScheduleClose}>
        <DialogTitle>Schedule Action</DialogTitle>
        <DialogContent>
          {/* Add content for scheduling here */}
          Schedule dialog content...
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleClose}>Cancel</Button>
          <Button onClick={handlePerformAction} color="primary">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={Boolean(deviceToDelete)} onClose={handleCancelRemove}>
        <DialogTitle>Delete Device</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{deviceToDelete?.deviceName}"? This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained">
           Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      <DeviceForm
        open={isAddDialogOpen}
        device={editingDevice}
        onClose={handleAddDialogClose}
        onSuccess={handleAddDeviceSuccess}
      />
    </Container>
  );
};

export default DeviceTable;
