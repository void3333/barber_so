import {useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Chip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import Swal from "sweetalert2";
import {useAuth} from "../../hooks/useAuth.js";
import {getClients} from "../../features/clients/api/getClients.jsx";
import {getServices} from "../../features/services/api/getServices.jsx";
import {getStaff} from "../../features/staff/api/getStaff.jsx";
import {getAppointments} from "../../features/appointments/getAppointments.jsx";
import {createAppointmentRecord} from "../../features/appointments/createAppointment.jsx";
import {updateAppointmentRecord} from "../../features/appointments/updateAppointment.jsx";
import {deleteAppointmentRecord} from "../../features/appointments/deleteAppointment.jsx";
import {getAppointmentErrorMessage} from "../../features/appointments/utils/getAppointmentErrorMessage.jsx";
import {toUtcIsoFromLocalDateTime} from "../../features/appointments/utils/toUtcIsoFromLocalDateTime.jsx";

const statusOptions = [
    {value: "scheduled", label: "Agendado"},
    {value: "confirmed", label: "Confirmado"},
    {value: "completed", label: "Concluído"},
    {value: "cancelled", label: "Cancelado"},
];

const statusLabelMap = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    completed: "Concluído",
    cancelled: "Cancelado",
};

const statusColorMap = {
    scheduled: "default",
    confirmed: "primary",
    completed: "success",
    cancelled: "error",
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

function formatDateTime(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
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

function SummaryCard({title, value, subtitle, icon}) {
    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "none",
                border: 1,
                borderColor: "divider",
            }}
        >
            <CardContent>
                <Stack spacing={1.5}>
                    <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>

                        <Box sx={{color: "text.secondary", display: "flex"}}>{icon}</Box>
                    </Box>

                    <Typography variant="h4" fontWeight={700}>
                        {value}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
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
    const status = appointment.status;

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "none",
                border: 1,
                borderColor: "divider",
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        direction={{xs: "column", md: "row"}}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{xs: "flex-start", md: "center"}}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                {clientName}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                {serviceName}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                                Profissional: {staffName}
                            </Typography>
                        </Box>

                        <Stack
                            direction={{xs: "column", sm: "row"}}
                            spacing={1}
                            alignItems={{xs: "flex-start", sm: "center"}}
                        >
                            <Typography variant="body2" color="text.secondary">
                                {formatDateTime(appointment.starts_at)}
                            </Typography>

                            <Chip
                                size="small"
                                label={statusLabelMap[status] || status}
                                color={statusColorMap[status] || "default"}
                                variant="outlined"
                            />
                        </Stack>
                    </Stack>

                    {appointment.notes && (
                        <Typography variant="body2" color="text.secondary">
                            {appointment.notes}
                        </Typography>
                    )}

                    <Divider/>

                    <Stack
                        direction={{xs: "column", lg: "row"}}
                        spacing={1}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                                size="small"
                                variant={status === "confirmed" ? "contained" : "outlined"}
                                onClick={() => onQuickStatusChange(appointment, "confirmed")}
                                disabled={busy}
                            >
                                Confirmar
                            </Button>

                            <Button
                                size="small"
                                variant={status === "completed" ? "contained" : "outlined"}
                                color="success"
                                onClick={() => onQuickStatusChange(appointment, "completed")}
                                disabled={busy}
                            >
                                Concluir
                            </Button>

                            <Button
                                size="small"
                                variant={status === "cancelled" ? "contained" : "outlined"}
                                color="error"
                                onClick={() => onQuickStatusChange(appointment, "cancelled")}
                                disabled={busy}
                            >
                                Cancelar
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                            <Button
                                size="small"
                                startIcon={<EditRoundedIcon/>}
                                onClick={() => onEdit(appointment)}
                                disabled={busy}
                            >
                                Editar
                            </Button>

                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteRoundedIcon/>}
                                onClick={() => onDelete(appointment)}
                                disabled={busy}
                            >
                                Excluir
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function AppointmentsPage() {
    const {barbershop} = useAuth();
    const queryClient = useQueryClient();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [dateFilter, setDateFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

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

    const {data: clients = []} = useQuery({
        queryKey: ["clients", barbershop?.id],
        queryFn: () => getClients(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const {data: services = []} = useQuery({
        queryKey: ["services", barbershop?.id],
        queryFn: () => getServices(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const {data: staff = []} = useQuery({
        queryKey: ["staff", barbershop?.id],
        queryFn: () => getStaff(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const createAppointmentMutation = useMutation({
        mutationFn: createAppointmentRecord,
        onSuccess: async () => {
            handleCloseCreateModal();
            await queryClient.invalidateQueries({queryKey: ["appointments", barbershop?.id]});
            await queryClient.refetchQueries({queryKey: ["appointments", barbershop?.id]});
        },
        onError: (mutationError) => {
            setFormError(getAppointmentErrorMessage(mutationError));
        },
    });

    const updateAppointmentMutation = useMutation({
        mutationFn: updateAppointmentRecord,
        onSuccess: async () => {
            handleCloseEditModal();
            await queryClient.invalidateQueries({queryKey: ["appointments", barbershop?.id]});
            await queryClient.refetchQueries({queryKey: ["appointments", barbershop?.id]});
        },
        onError: (mutationError) => {
            setFormError(getAppointmentErrorMessage(mutationError));
        },
    });

    const deleteAppointmentMutation = useMutation({
        mutationFn: deleteAppointmentRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["appointments", barbershop?.id]});
            await queryClient.refetchQueries({queryKey: ["appointments", barbershop?.id]});
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

    const filteredAppointments = useMemo(() => {
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

        result.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

        return result;
    }, [appointments, dateFilter, statusFilter]);

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

    if (!barbershop?.id) {
        return (
            <Alert severity="warning">
                Nenhuma barbearia encontrada para este usuário.
            </Alert>
        );
    }

    if (isLoading) {
        return (
            <Box sx={{display: "grid", placeItems: "center", py: 8}}>
                <CircularProgress/>
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

    return (
        <>
            <Stack spacing={3} sx={{width: "100%"}}>
                <Stack
                    direction={{xs: "column", md: "row"}}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Agendamentos
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                            Visão operacional da agenda, com ações rápidas e filtros.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon/>}
                        onClick={handleOpenCreateModal}
                    >
                        Novo agendamento
                    </Button>
                </Stack>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} xl={3}>
                        <SummaryCard
                            title="Hoje"
                            value={summary.todayCount}
                            subtitle="Agendamentos do dia"
                            icon={<TodayRoundedIcon/>}
                        />
                    </Grid>

                    <Grid item xs={12} md={6} xl={3}>
                        <SummaryCard
                            title="Próximos"
                            value={summary.upcomingCount}
                            subtitle="Agendamentos futuros"
                            icon={<AccessTimeRoundedIcon/>}
                        />
                    </Grid>

                    <Grid item xs={12} md={6} xl={3}>
                        <SummaryCard
                            title="Confirmados"
                            value={summary.confirmedCount}
                            subtitle="Prontos para atendimento"
                            icon={<CheckCircleRoundedIcon/>}
                        />
                    </Grid>

                    <Grid item xs={12} md={6} xl={3}>
                        <SummaryCard
                            title="Concluídos"
                            value={summary.completedCount}
                            subtitle="Atendimentos concluídos"
                            icon={<EventRoundedIcon/>}
                        />
                    </Grid>
                </Grid>

                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: "none",
                        border: 1,
                        borderColor: "divider",
                    }}
                >
                    <CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight={700}>
                                Filtros rápidos
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                    label="Hoje"
                                    clickable
                                    color={dateFilter === "today" ? "primary" : "default"}
                                    variant={dateFilter === "today" ? "filled" : "outlined"}
                                    onClick={() => setDateFilter("today")}
                                />
                                <Chip
                                    label="Próximos"
                                    clickable
                                    color={dateFilter === "upcoming" ? "primary" : "default"}
                                    variant={dateFilter === "upcoming" ? "filled" : "outlined"}
                                    onClick={() => setDateFilter("upcoming")}
                                />
                                <Chip
                                    label="Todos"
                                    clickable
                                    color={dateFilter === "all" ? "primary" : "default"}
                                    variant={dateFilter === "all" ? "filled" : "outlined"}
                                    onClick={() => setDateFilter("all")}
                                />
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                    label="Todos os status"
                                    clickable
                                    color={statusFilter === "all" ? "primary" : "default"}
                                    variant={statusFilter === "all" ? "filled" : "outlined"}
                                    onClick={() => setStatusFilter("all")}
                                />
                                {statusOptions.map((option) => (
                                    <Chip
                                        key={option.value}
                                        label={option.label}
                                        clickable
                                        color={statusFilter === option.value ? "primary" : "default"}
                                        variant={statusFilter === option.value ? "filled" : "outlined"}
                                        onClick={() => setStatusFilter(option.value)}
                                    />
                                ))}
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>

                <Stack spacing={2}>
                    {filteredAppointments.length === 0 ? (
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: "none",
                                border: 1,
                                borderColor: "divider",
                            }}
                        >
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Nenhum agendamento encontrado com os filtros atuais.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onEdit={handleOpenEditModal}
                                onDelete={handleDeleteAppointment}
                                onQuickStatusChange={handleQuickStatusChange}
                                busy={isBusy}
                            />
                        ))
                    )}
                </Stack>
            </Stack>

            <Dialog
                open={openCreateModal}
                onClose={handleCloseCreateModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Novo agendamento</DialogTitle>

                <Box component="form" onSubmit={handleCreateAppointment}>
                    <DialogContent>
                        <Stack spacing={2} sx={{mt: 1}}>
                            {clients.length === 0 && (
                                <Alert severity="warning">
                                    Cadastre pelo menos um cliente antes de criar um agendamento.
                                </Alert>
                            )}

                            {services.length === 0 && (
                                <Alert severity="warning">
                                    Cadastre pelo menos um serviço antes de criar um agendamento.
                                </Alert>
                            )}

                            {formError && <Alert severity="error">{formError}</Alert>}

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

                            <TextField
                                label="Data e hora"
                                type="datetime-local"
                                value={startsAt}
                                onChange={(event) => setStartsAt(event.target.value)}
                                required
                                fullWidth
                                InputLabelProps={{shrink: true}}
                            />

                            <TextField
                                select
                                label="Status"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                required
                                fullWidth
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Observações"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                fullWidth
                                multiline
                                minRows={3}
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{px: 3, pb: 3}}>
                        <Button onClick={handleCloseCreateModal} disabled={createAppointmentMutation.isPending}>
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                createAppointmentMutation.isPending ||
                                clients.length === 0 ||
                                services.length === 0
                            }
                        >
                            {createAppointmentMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={openEditModal}
                onClose={handleCloseEditModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Editar agendamento</DialogTitle>

                <Box component="form" onSubmit={handleEditAppointment}>
                    <DialogContent>
                        <Stack spacing={2} sx={{mt: 1}}>
                            {formError && <Alert severity="error">{formError}</Alert>}

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

                            <TextField
                                label="Data e hora"
                                type="datetime-local"
                                value={startsAt}
                                onChange={(event) => setStartsAt(event.target.value)}
                                required
                                fullWidth
                                InputLabelProps={{shrink: true}}
                            />

                            <TextField
                                select
                                label="Status"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                required
                                fullWidth
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Observações"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                fullWidth
                                multiline
                                minRows={3}
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{px: 3, pb: 3}}>
                        <Button onClick={handleCloseEditModal} disabled={updateAppointmentMutation.isPending}>
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={updateAppointmentMutation.isPending}
                        >
                            {updateAppointmentMutation.isPending ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
}