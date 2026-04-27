import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth.js";
import { getClients } from "../../features/clients/api/getClients.jsx";
import { getServices } from "../../features/services/api/getServices.jsx";
import { getStaff } from "../../features/staff/api/getStaff.jsx";
import { getAppointments } from "../../features/appointments/getAppointments.jsx";
import { createAppointmentRecord } from "../../features/appointments/createAppointment.jsx";
import { updateAppointmentRecord } from "../../features/appointments/updateAppointment.jsx";
import { deleteAppointmentRecord } from "../../features/appointments/deleteAppointment.jsx";
import { getAppointmentErrorMessage } from "../../features/appointments/utils/getAppointmentErrorMessage.js";
import { toUtcIsoFromLocalDateTime } from "../../features/appointments/utils/toUtcIsoFromLocalDateTime.js";

const statusOptions = [
    { value: "scheduled", label: "Agendado" },
    { value: "confirmed", label: "Confirmado" },
    { value: "completed", label: "Concluído" },
    { value: "cancelled", label: "Cancelado" },
];

const statusMetaMap = {
    scheduled: {
        label: "Agendado",
        plural: "Agendados",
        icon: <EventRoundedIcon />,
        color: "#7a4f1f",
        bg: "rgba(196,138,63,0.14)",
        border: "rgba(196,138,63,0.28)",
    },
    confirmed: {
        label: "Confirmado",
        plural: "Confirmados",
        icon: <CheckCircleRoundedIcon />,
        color: "#1f6f68",
        bg: "rgba(31,111,104,0.12)",
        border: "rgba(31,111,104,0.24)",
    },
    completed: {
        label: "Concluído",
        plural: "Concluídos",
        icon: <AssignmentTurnedInRoundedIcon />,
        color: "#2f7d32",
        bg: "rgba(47,125,50,0.12)",
        border: "rgba(47,125,50,0.24)",
    },
    cancelled: {
        label: "Cancelado",
        plural: "Cancelados",
        icon: <CancelRoundedIcon />,
        color: "#b23b3b",
        bg: "rgba(178,59,59,0.12)",
        border: "rgba(178,59,59,0.24)",
    },
};

function toDatetimeLocalValue(value) {
    if (!value) return "";

    const date = new Date(value);
    const pad = (num) => String(num).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateParts(value) {
    if (!value) {
        return {
            date: "Sem data",
            time: "--:--",
            weekday: "Agenda",
        };
    }

    const date = new Date(value);

    return {
        date: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
        }),
        time: date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        weekday: date.toLocaleDateString("pt-BR", {
            weekday: "short",
        }),
    };
}

function isToday(dateString) {
    if (!dateString) return false;

    const target = new Date(dateString);
    const now = new Date();

    return (
        target.getFullYear() === now.getFullYear() &&
        target.getMonth() === now.getMonth() &&
        target.getDate() === now.getDate()
    );
}

function isFuture(dateString) {
    if (!dateString) return false;
    return new Date(dateString).getTime() >= Date.now();
}

function SummaryCard({ title, value, subtitle, icon, color, bg }) {
    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: "0 14px 30px rgba(17,18,20,0.06)",
                border: "1px solid rgba(17,18,20,0.07)",
                bgcolor: "#fffdfa",
            }}
        >
            <CardContent sx={{ p: 2.4 }}>
                <Stack spacing={2}>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            color,
                            bgcolor: bg,
                        }}
                    >
                        {icon}
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.58)", fontWeight: 800 }}>
                            {title}
                        </Typography>

                        <Typography variant="h3" fontWeight={900} sx={{ color: "#17181b", lineHeight: 1.05, mt: 0.5 }}>
                            {value}
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.56)" }}>
                        {subtitle}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

function FilterChip({ label, count, selected, onClick }) {
    return (
        <Chip
            clickable
            onClick={onClick}
            label={
                <Stack direction="row" spacing={1} alignItems="center">
                    <span>{label}</span>
                    {count !== undefined && (
                        <Box
                            component="span"
                            sx={{
                                minWidth: 22,
                                px: 0.8,
                                py: 0.1,
                                borderRadius: 99,
                                bgcolor: selected ? "rgba(255,255,255,0.18)" : "rgba(17,18,20,0.08)",
                                fontSize: 12,
                                fontWeight: 900,
                            }}
                        >
                            {count}
                        </Box>
                    )}
                </Stack>
            }
            sx={{
                height: 36,
                borderRadius: 2,
                fontWeight: 850,
                color: selected ? "#fff" : "#17181b",
                bgcolor: selected ? "#17181b" : "rgba(255,255,255,0.82)",
                border: selected ? "1px solid #17181b" : "1px solid rgba(17,18,20,0.1)",
                "&:hover": {
                    bgcolor: selected ? "#17181b" : "rgba(17,18,20,0.06)",
                },
            }}
        />
    );
}

function AppointmentCard({
    appointment,
    onEdit,
    onDelete,
    onQuickStatusChange,
    busy,
}) {
    const clientName = appointment.client?.name || "Cliente";
    const serviceName = appointment.service?.name || "Serviço";
    const staffName = appointment.staff?.name || "Sem profissional";
    const status = statusMetaMap[appointment.status] || statusMetaMap.scheduled;
    const { date, time, weekday } = formatDateParts(appointment.starts_at);

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: "0 12px 28px rgba(17,18,20,0.06)",
                border: "1px solid rgba(17,18,20,0.07)",
                bgcolor: "#fffdfa",
                overflow: "hidden",
            }}
        >
            <CardContent sx={{ p: 0 }}>
                <Stack direction={{ xs: "column", md: "row" }}>
                    <Box
                        sx={{
                            width: { xs: "100%", md: 138 },
                            p: 2.2,
                            bgcolor: "#17181b",
                            color: "#fff",
                            display: "flex",
                            flexDirection: { xs: "row", md: "column" },
                            justifyContent: "space-between",
                            alignItems: { xs: "center", md: "flex-start" },
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.62)", textTransform: "uppercase" }}>
                                {weekday}
                            </Typography>

                            <Typography variant="h5" fontWeight={900} sx={{ mt: 0.4 }}>
                                {time}
                            </Typography>

                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
                                {date}
                            </Typography>
                        </Box>

                        <Chip
                            size="small"
                            label={status.label}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 850,
                                color: "#fff",
                                bgcolor: "rgba(255,255,255,0.12)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        />
                    </Box>

                    <Stack spacing={2} sx={{ p: 2.2, flex: 1, minWidth: 0 }}>
                        <Stack
                            direction={{ xs: "column", lg: "row" }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", lg: "center" }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h6" fontWeight={900} sx={{ color: "#17181b" }} noWrap>
                                    {clientName}
                                </Typography>

                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                    <Chip
                                        icon={<ContentCutRoundedIcon sx={{ fontSize: 17 }} />}
                                        label={serviceName}
                                        size="small"
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 750,
                                            bgcolor: "rgba(196,138,63,0.12)",
                                            color: "#7a4f1f",
                                            "& .MuiChip-icon": { color: "#7a4f1f" },
                                        }}
                                    />

                                    <Chip
                                        icon={<PersonRoundedIcon sx={{ fontSize: 17 }} />}
                                        label={staffName}
                                        size="small"
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 750,
                                            bgcolor: "rgba(31,111,104,0.1)",
                                            color: "#1f6f68",
                                            "& .MuiChip-icon": { color: "#1f6f68" },
                                        }}
                                    />
                                </Stack>
                            </Box>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Tooltip title="Editar agendamento">
                                    <span>
                                        <IconButton
                                            onClick={() => onEdit(appointment)}
                                            disabled={busy}
                                            sx={{
                                                border: "1px solid rgba(17,18,20,0.1)",
                                                bgcolor: "rgba(17,18,20,0.03)",
                                            }}
                                        >
                                            <EditRoundedIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Excluir agendamento">
                                    <span>
                                        <IconButton
                                            onClick={() => onDelete(appointment)}
                                            disabled={busy}
                                            sx={{
                                                border: "1px solid rgba(178,59,59,0.18)",
                                                bgcolor: "rgba(178,59,59,0.07)",
                                                color: "#b23b3b",
                                            }}
                                        >
                                            <DeleteRoundedIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Stack>

                        {appointment.notes && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "rgba(17,18,20,0.62)",
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: "rgba(17,18,20,0.035)",
                                }}
                            >
                                {appointment.notes}
                            </Typography>
                        )}

                        <Divider />

                        <Stack
                            direction={{ xs: "column", xl: "row" }}
                            spacing={1}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", xl: "center" }}
                        >
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Button
                                    size="small"
                                    variant={appointment.status === "confirmed" ? "contained" : "outlined"}
                                    startIcon={<CheckCircleRoundedIcon />}
                                    onClick={() => onQuickStatusChange(appointment, "confirmed")}
                                    disabled={busy}
                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                                >
                                    Confirmar
                                </Button>

                                <Button
                                    size="small"
                                    variant={appointment.status === "completed" ? "contained" : "outlined"}
                                    color="success"
                                    startIcon={<AssignmentTurnedInRoundedIcon />}
                                    onClick={() => onQuickStatusChange(appointment, "completed")}
                                    disabled={busy}
                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                                >
                                    Concluir
                                </Button>

                                <Button
                                    size="small"
                                    variant={appointment.status === "cancelled" ? "contained" : "outlined"}
                                    color="error"
                                    startIcon={<CancelRoundedIcon />}
                                    onClick={() => onQuickStatusChange(appointment, "cancelled")}
                                    disabled={busy}
                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                                >
                                    Cancelar
                                </Button>
                            </Stack>

                            <Chip
                                icon={status.icon}
                                label={status.plural}
                                sx={{
                                    width: "fit-content",
                                    borderRadius: 2,
                                    fontWeight: 850,
                                    color: status.color,
                                    bgcolor: status.bg,
                                    border: `1px solid ${status.border}`,
                                    "& .MuiChip-icon": { color: status.color },
                                }}
                            />
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

function AppointmentDialog({
    open,
    title,
    submitLabel,
    isSaving,
    onClose,
    onSubmit,
    clients,
    services,
    staff,
    formError,
    clientId,
    setClientId,
    serviceId,
    setServiceId,
    staffId,
    setStaffId,
    startsAt,
    setStartsAt,
    status,
    setStatus,
    notes,
    setNotes,
    disableSubmit,
    showCreateWarnings,
}) {
    const selectedClient = clients.find((client) => client.id === clientId);
    const selectedService = services.find((service) => service.id === serviceId);
    const selectedStaff = staff.find((member) => member.id === staffId);
    const selectedStatus = statusMetaMap[status] || statusMetaMap.scheduled;
    const previewDate = startsAt
        ? new Date(startsAt).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        })
        : "Data e hora";
    const missingSetupWarning = showCreateWarnings && (clients.length === 0 || services.length === 0);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: "#fffdfa",
                    overflow: "hidden",
                    maxHeight: "calc(100vh - 32px)",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <DialogTitle
                sx={{
                    p: 0,
                    bgcolor: "#17181b",
                    color: "#fff",
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ p: 2.5 }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: "rgba(216,155,73,0.16)",
                                color: "#d89b49",
                                flexShrink: 0,
                            }}
                        >
                            <CalendarMonthRoundedIcon />
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={900}>
                                {title}
                            </Typography>

                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                                Monte o atendimento e revise a prévia antes de salvar.
                            </Typography>
                        </Box>
                    </Stack>

                    <Chip
                        icon={selectedStatus.icon}
                        label={selectedStatus.label}
                        sx={{
                            borderRadius: 2,
                            color: "#fff",
                            bgcolor: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            fontWeight: 850,
                            "& .MuiChip-icon": { color: "#d89b49" },
                        }}
                    />
                </Stack>
            </DialogTitle>

            <Box
                component="form"
                onSubmit={onSubmit}
                sx={{
                    minHeight: 0,
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                }}
            >
                <DialogContent
                    sx={{
                        minHeight: 0,
                        overflowY: "auto",
                        p: { xs: 2, md: 2.5 },
                    }}
                >
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} md={5}>
                            <Box
                                sx={{
                                    height: "100%",
                                    minHeight: 260,
                                    p: 2.2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(17,18,20,0.035)",
                                    border: "1px solid rgba(17,18,20,0.08)",
                                }}
                            >
                                <Stack spacing={2.2} sx={{ height: "100%" }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight={850} sx={{ color: "rgba(17,18,20,0.58)" }}>
                                            Prévia do agendamento
                                        </Typography>

                                        <Typography variant="h5" fontWeight={900} sx={{ mt: 0.6, color: "#17181b" }}>
                                            {previewDate}
                                        </Typography>
                                    </Box>

                                    <Divider />

                                    <Stack spacing={1.5}>
                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                            <PersonRoundedIcon sx={{ color: "#1f6f68" }} />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="caption" sx={{ color: "rgba(17,18,20,0.52)" }}>
                                                    Cliente
                                                </Typography>
                                                <Typography fontWeight={850} noWrap>
                                                    {selectedClient?.name || "Selecione um cliente"}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                            <ContentCutRoundedIcon sx={{ color: "#7a4f1f" }} />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="caption" sx={{ color: "rgba(17,18,20,0.52)" }}>
                                                    Serviço
                                                </Typography>
                                                <Typography fontWeight={850} noWrap>
                                                    {selectedService?.name || "Selecione um serviço"}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1.2} alignItems="center">
                                            <CheckCircleRoundedIcon sx={{ color: selectedStatus.color }} />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="caption" sx={{ color: "rgba(17,18,20,0.52)" }}>
                                                    Profissional
                                                </Typography>
                                                <Typography fontWeight={850} noWrap>
                                                    {selectedStaff?.name || "Sem profissional"}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>

                                    <Box sx={{ flex: 1 }} />

                                    <Chip
                                        label={selectedStatus.plural}
                                        sx={{
                                            width: "fit-content",
                                            borderRadius: 2,
                                            color: selectedStatus.color,
                                            bgcolor: selectedStatus.bg,
                                            border: `1px solid ${selectedStatus.border}`,
                                            fontWeight: 850,
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={7}>
                            <Stack spacing={2}>
                        {missingSetupWarning && (
                            <Alert severity="warning">
                                Cadastre pelo menos um cliente e um serviço antes de criar um agendamento.
                            </Alert>
                        )}

                        {formError && <Alert severity="error">{formError}</Alert>}

                        <Box>
                            <Typography fontWeight={900} sx={{ color: "#17181b", mb: 1.5 }}>
                                Dados do atendimento
                            </Typography>

                            <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    label="Cliente"
                                    value={clientId}
                                    onChange={(event) => setClientId(event.target.value)}
                                    required
                                    fullWidth
                                >
                                    <MenuItem value="" disabled>
                                        Selecione um cliente
                                    </MenuItem>

                                    {clients.map((client) => (
                                        <MenuItem key={client.id} value={client.id}>
                                            {client.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label="Serviço"
                                    value={serviceId}
                                    onChange={(event) => setServiceId(event.target.value)}
                                    required
                                    fullWidth
                                >
                                    <MenuItem value="" disabled>
                                        Selecione um serviço
                                    </MenuItem>

                                    {services.map((service) => (
                                        <MenuItem key={service.id} value={service.id}>
                                            {service.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label="Profissional"
                                    value={staffId}
                                    onChange={(event) => setStaffId(event.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value="">Sem profissional</MenuItem>

                                    {staff.map((member) => (
                                        <MenuItem key={member.id} value={member.id}>
                                            {member.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Data e hora"
                                    type="datetime-local"
                                    value={startsAt}
                                    onChange={(event) => setStartsAt(event.target.value)}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Observações"
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                />
                            </Grid>
                            </Grid>
                        </Box>

                        <Box>
                            <Typography fontWeight={900} sx={{ color: "#17181b", mb: 1.2 }}>
                                Status
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {statusOptions.map((option) => {
                                    const meta = statusMetaMap[option.value];
                                    const isSelected = status === option.value;

                                    return (
                                        <Button
                                            key={option.value}
                                            type="button"
                                            variant={isSelected ? "contained" : "outlined"}
                                            startIcon={meta.icon}
                                            onClick={() => setStatus(option.value)}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 850,
                                                color: isSelected ? "#fff" : meta.color,
                                                bgcolor: isSelected ? meta.color : "transparent",
                                                borderColor: meta.border,
                                                "&:hover": {
                                                    bgcolor: isSelected ? meta.color : meta.bg,
                                                    borderColor: meta.border,
                                                },
                                            }}
                                        >
                                            {option.label}
                                        </Button>
                                    );
                                })}
                            </Stack>
                        </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions
                    sx={{
                        flexShrink: 0,
                        px: 3,
                        py: 2,
                        borderTop: "1px solid rgba(17,18,20,0.08)",
                        bgcolor: "#fffdfa",
                    }}
                >
                    <Button onClick={onClose} disabled={isSaving} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}>
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={disableSubmit}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 850 }}
                    >
                        {isSaving ? "Salvando..." : submitLabel}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default function AppointmentsPage() {
    const { barbershop } = useAuth();
    const queryClient = useQueryClient();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [dateFilter, setDateFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [clientId, setClientId] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [staffId, setStaffId] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [status, setStatus] = useState("scheduled");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState("");

    const {
        data: appointments = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["appointments", barbershop?.id],
        queryFn: () => getAppointments(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const { data: clients = [] } = useQuery({
        queryKey: ["clients", barbershop?.id],
        queryFn: () => getClients(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const { data: services = [] } = useQuery({
        queryKey: ["services", barbershop?.id],
        queryFn: () => getServices(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const { data: staff = [] } = useQuery({
        queryKey: ["staff", barbershop?.id],
        queryFn: () => getStaff(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const createAppointmentMutation = useMutation({
        mutationFn: createAppointmentRecord,
        onSuccess: async () => {
            handleCloseCreateModal();
            await queryClient.invalidateQueries({ queryKey: ["appointments", barbershop?.id] });
            await queryClient.refetchQueries({ queryKey: ["appointments", barbershop?.id] });
        },
        onError: (mutationError) => {
            setFormError(getAppointmentErrorMessage(mutationError));
        },
    });

    const updateAppointmentMutation = useMutation({
        mutationFn: updateAppointmentRecord,
        onSuccess: async () => {
            handleCloseEditModal();
            await queryClient.invalidateQueries({ queryKey: ["appointments", barbershop?.id] });
            await queryClient.refetchQueries({ queryKey: ["appointments", barbershop?.id] });
        },
        onError: (mutationError) => {
            setFormError(getAppointmentErrorMessage(mutationError));
        },
    });

    const deleteAppointmentMutation = useMutation({
        mutationFn: deleteAppointmentRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["appointments", barbershop?.id] });
            await queryClient.refetchQueries({ queryKey: ["appointments", barbershop?.id] });
        },
    });

    function resetForm() {
        setClientId("");
        setServiceId("");
        setStaffId("");
        setStartsAt("");
        setStatus("scheduled");
        setNotes("");
        setFormError("");
        setSelectedAppointment(null);
    }

    function handleOpenCreateModal() {
        resetForm();
        setOpenCreateModal(true);
    }

    function handleCloseCreateModal() {
        if (createAppointmentMutation.isPending) return;
        setOpenCreateModal(false);
        resetForm();
    }

    function handleOpenEditModal(appointment) {
        setSelectedAppointment(appointment);
        setClientId(appointment.client?.id || "");
        setServiceId(appointment.service?.id || "");
        setStaffId(appointment.staff?.id || "");
        setStartsAt(toDatetimeLocalValue(appointment.starts_at));
        setStatus(appointment.status || "scheduled");
        setNotes(appointment.notes || "");
        setFormError("");
        setOpenEditModal(true);
    }

    function handleCloseEditModal() {
        if (updateAppointmentMutation.isPending) return;
        setOpenEditModal(false);
        resetForm();
    }

    async function handleCreateAppointment(event) {
        event.preventDefault();
        setFormError("");

        if (!clientId) {
            setFormError("Selecione um cliente.");
            return;
        }

        if (!serviceId) {
            setFormError("Selecione um serviço.");
            return;
        }

        if (!startsAt) {
            setFormError("Informe a data e hora do agendamento.");
            return;
        }

        await createAppointmentMutation.mutateAsync({
            barbershopId: barbershop.id,
            clientId,
            serviceId,
            staffId,
            startsAt: toUtcIsoFromLocalDateTime(startsAt),
            status,
            notes,
        });
    }

    async function handleEditAppointment(event) {
        event.preventDefault();
        setFormError("");

        if (!clientId) {
            setFormError("Selecione um cliente.");
            return;
        }

        if (!serviceId) {
            setFormError("Selecione um serviço.");
            return;
        }

        if (!startsAt) {
            setFormError("Informe a data e hora do agendamento.");
            return;
        }

        await updateAppointmentMutation.mutateAsync({
            id: selectedAppointment.id,
            clientId,
            serviceId,
            staffId,
            startsAt: toUtcIsoFromLocalDateTime(startsAt),
            status,
            notes,
        });
    }

    async function handleDeleteAppointment(appointment) {
        const result = await Swal.fire({
            title: "Excluir agendamento?",
            text: "Este agendamento será removido.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Excluir",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            target: document.body,
            didOpen: () => {
                const container = document.querySelector(".swal2-container");
                if (container) {
                    container.style.zIndex = "99999";
                }
            },
        });

        if (!result.isConfirmed) return;

        try {
            await deleteAppointmentMutation.mutateAsync(appointment.id);

            await Swal.fire({
                title: "Agendamento excluído",
                text: "O agendamento foi removido com sucesso.",
                icon: "success",
                confirmButtonText: "OK",
                target: document.body,
                didOpen: () => {
                    const container = document.querySelector(".swal2-container");
                    if (container) {
                        container.style.zIndex = "99999";
                    }
                },
            });
        } catch (mutationError) {
            await Swal.fire({
                title: "Erro ao excluir",
                text: getAppointmentErrorMessage(mutationError),
                icon: "error",
                confirmButtonText: "OK",
                target: document.body,
                didOpen: () => {
                    const container = document.querySelector(".swal2-container");
                    if (container) {
                        container.style.zIndex = "99999";
                    }
                },
            });
        }
    }

    async function handleQuickStatusChange(appointment, nextStatus) {
        try {
            await updateAppointmentMutation.mutateAsync({
                id: appointment.id,
                clientId: appointment.client?.id,
                serviceId: appointment.service?.id,
                staffId: appointment.staff?.id || null,
                startsAt: appointment.starts_at,
                status: nextStatus,
                notes: appointment.notes || "",
            });
        } catch (error) {
            return error.message;
        }
    }

    const statusCounts = useMemo(() => {
        return appointments.reduce(
            (accumulator, appointment) => {
                const appointmentStatus = appointment.status || "scheduled";
                accumulator[appointmentStatus] = (accumulator[appointmentStatus] || 0) + 1;
                return accumulator;
            },
            {
                scheduled: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0,
            }
        );
    }, [appointments]);

    const summary = useMemo(() => {
        const todayCount = appointments.filter((item) => isToday(item.starts_at)).length;
        const upcomingCount = appointments.filter((item) => isFuture(item.starts_at)).length;
        const confirmedCount = appointments.filter((item) => item.status === "confirmed").length;
        const completedCount = appointments.filter((item) => item.status === "completed").length;

        return {
            todayCount,
            upcomingCount,
            confirmedCount,
            completedCount,
        };
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        let result = [...appointments];

        if (dateFilter === "today") {
            result = result.filter((item) => isToday(item.starts_at));
        }

        if (dateFilter === "upcoming") {
            result = result.filter((item) => isFuture(item.starts_at));
        }

        if (statusFilter !== "all") {
            result = result.filter((item) => item.status === statusFilter);
        }

        if (normalizedSearch) {
            result = result.filter((item) => {
                const searchable = [
                    item.client?.name,
                    item.service?.name,
                    item.staff?.name,
                    item.notes,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchable.includes(normalizedSearch);
            });
        }

        result.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

        return result;
    }, [appointments, dateFilter, statusFilter, searchTerm]);

    if (!barbershop?.id) {
        return (
            <Alert severity="warning">
                Nenhuma barbearia encontrada para este usuário.
            </Alert>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error">
                {error.message || "Erro ao carregar agendamentos."}
            </Alert>
        );
    }

    const isBusy =
        createAppointmentMutation.isPending ||
        updateAppointmentMutation.isPending ||
        deleteAppointmentMutation.isPending;

    const summaryCards = [
        {
            title: "Hoje",
            value: summary.todayCount,
            subtitle: "Agendamentos do dia",
            icon: <TodayRoundedIcon />,
            color: "#8c3f62",
            bg: "rgba(140,63,98,0.12)",
        },
        {
            title: "Próximos",
            value: summary.upcomingCount,
            subtitle: "Atendimentos na fila",
            icon: <AccessTimeRoundedIcon />,
            color: "#7a4f1f",
            bg: "rgba(196,138,63,0.16)",
        },
        {
            title: "Confirmados",
            value: summary.confirmedCount,
            subtitle: "Prontos para atender",
            icon: <CheckCircleRoundedIcon />,
            color: "#1f6f68",
            bg: "rgba(31,111,104,0.12)",
        },
        {
            title: "Concluídos",
            value: summary.completedCount,
            subtitle: "Atendimentos finalizados",
            icon: <AssignmentTurnedInRoundedIcon />,
            color: "#2f7d32",
            bg: "rgba(47,125,50,0.12)",
        },
    ];

    return (
        <>
            <Stack spacing={3} sx={{ width: "100%" }}>
                <Box
                    sx={{
                        borderRadius: 2,
                        p: { xs: 2.5, md: 3 },
                        bgcolor: "#17181b",
                        color: "#fff",
                        boxShadow: "0 18px 42px rgba(17,18,20,0.14)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", md: "center" }}
                    >
                        <Stack spacing={1.5}>
                            <Chip
                                icon={<CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />}
                                label={`${appointments.length} agendamento(s)`}
                                sx={{
                                    width: "fit-content",
                                    borderRadius: 2,
                                    color: "#ffd69a",
                                    bgcolor: "rgba(216,155,73,0.14)",
                                    border: "1px solid rgba(216,155,73,0.25)",
                                    fontWeight: 850,
                                    "& .MuiChip-icon": { color: "#d89b49" },
                                }}
                            />

                            <Box>
                                <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.12 }}>
                                    Agendamentos
                                </Typography>

                                <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.68)" }}>
                                    Controle a agenda, filtre atendimentos e atualize status em poucos cliques.
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddRoundedIcon />}
                            onClick={handleOpenCreateModal}
                            sx={{
                                minHeight: 50,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 900,
                                bgcolor: "#d89b49",
                                color: "#17181b",
                                boxShadow: "none",
                                "&:hover": {
                                    bgcolor: "#e1aa60",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            Novo agendamento
                        </Button>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            lg: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: 2,
                    }}
                >
                    {summaryCards.map((card) => (
                        <SummaryCard key={card.title} {...card} />
                    ))}
                </Box>

                <Card
                    sx={{
                        borderRadius: 2,
                        boxShadow: "0 14px 34px rgba(17,18,20,0.06)",
                        border: "1px solid rgba(17,18,20,0.07)",
                        bgcolor: "#fffdfa",
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Stack spacing={2.5}>
                            <Stack
                                direction={{ xs: "column", lg: "row" }}
                                spacing={2}
                                justifyContent="space-between"
                                alignItems={{ xs: "stretch", lg: "center" }}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={900} sx={{ color: "#17181b" }}>
                                        Filtros rápidos
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.56)", mt: 0.3 }}>
                                        {filteredAppointments.length} resultado(s) na visualização atual.
                                    </Typography>
                                </Box>

                                <TextField
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Buscar cliente, serviço ou profissional"
                                    size="small"
                                    sx={{
                                        width: { xs: "100%", lg: 360 },
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: "rgba(17,18,20,0.035)",
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRoundedIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm ? (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setSearchTerm("")}>
                                                    <ClearRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                    }}
                                />
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <FilterChip
                                    label="Todos"
                                    count={appointments.length}
                                    selected={dateFilter === "all"}
                                    onClick={() => setDateFilter("all")}
                                />
                                <FilterChip
                                    label="Hoje"
                                    count={summary.todayCount}
                                    selected={dateFilter === "today"}
                                    onClick={() => setDateFilter("today")}
                                />
                                <FilterChip
                                    label="Próximos"
                                    count={summary.upcomingCount}
                                    selected={dateFilter === "upcoming"}
                                    onClick={() => setDateFilter("upcoming")}
                                />
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <FilterChip
                                    label="Todos os status"
                                    count={appointments.length}
                                    selected={statusFilter === "all"}
                                    onClick={() => setStatusFilter("all")}
                                />

                                {statusOptions.map((option) => (
                                    <FilterChip
                                        key={option.value}
                                        label={option.label}
                                        count={statusCounts[option.value] || 0}
                                        selected={statusFilter === option.value}
                                        onClick={() => setStatusFilter(option.value)}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                {filteredAppointments.length === 0 ? (
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: "0 14px 34px rgba(17,18,20,0.06)",
                            border: "1px dashed rgba(17,18,20,0.14)",
                            bgcolor: "#fffdfa",
                        }}
                    >
                        <CardContent sx={{ py: 5, textAlign: "center" }}>
                            <CalendarMonthRoundedIcon sx={{ fontSize: 42, color: "rgba(17,18,20,0.34)", mb: 1 }} />

                            <Typography fontWeight={900} sx={{ color: "#17181b" }}>
                                Nenhum agendamento encontrado
                            </Typography>

                            <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.58)", mt: 0.5 }}>
                                Ajuste os filtros ou crie um novo horário para movimentar a agenda.
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {filteredAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onEdit={handleOpenEditModal}
                                onDelete={handleDeleteAppointment}
                                onQuickStatusChange={handleQuickStatusChange}
                                busy={isBusy}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>

            <AppointmentDialog
                open={openCreateModal}
                title="Novo agendamento"
                submitLabel="Salvar"
                isSaving={createAppointmentMutation.isPending}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateAppointment}
                clients={clients}
                services={services}
                staff={staff}
                formError={formError}
                clientId={clientId}
                setClientId={setClientId}
                serviceId={serviceId}
                setServiceId={setServiceId}
                staffId={staffId}
                setStaffId={setStaffId}
                startsAt={startsAt}
                setStartsAt={setStartsAt}
                status={status}
                setStatus={setStatus}
                notes={notes}
                setNotes={setNotes}
                disableSubmit={
                    createAppointmentMutation.isPending ||
                    clients.length === 0 ||
                    services.length === 0
                }
                showCreateWarnings
            />

            <AppointmentDialog
                open={openEditModal}
                title="Editar agendamento"
                submitLabel="Salvar alterações"
                isSaving={updateAppointmentMutation.isPending}
                onClose={handleCloseEditModal}
                onSubmit={handleEditAppointment}
                clients={clients}
                services={services}
                staff={staff}
                formError={formError}
                clientId={clientId}
                setClientId={setClientId}
                serviceId={serviceId}
                setServiceId={setServiceId}
                staffId={staffId}
                setStaffId={setStaffId}
                startsAt={startsAt}
                setStartsAt={setStartsAt}
                status={status}
                setStatus={setStatus}
                notes={notes}
                setNotes={setNotes}
                disableSubmit={updateAppointmentMutation.isPending}
                showCreateWarnings={false}
            />
        </>
    );
}
