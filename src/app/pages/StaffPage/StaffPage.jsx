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
    FormControlLabel,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth.js";
import { getStaff } from "../../features/staff/api/getStaff.jsx";
import { createStaffRecord } from "../../features/staff/api/createStaff.jsx";
import { updateStaffRecord } from "../../features/staff/api/updateStaff.jsx";
import { deleteStaffRecord } from "../../features/staff/api/deleteStaff.jsx";
import { getStaffAvailability } from "../../features/staffAvailability/api/getStaffAvailability.jsx";
import { createStaffAvailabilityRecord } from "../../features/staffAvailability/api/createStaffAvailability.jsx";
import { updateStaffAvailabilityRecord } from "../../features/staffAvailability/api/updateStaffAvailability.jsx";
import { deleteStaffAvailabilityRecord } from "../../features/staffAvailability/api/deleteStaffAvailability.jsx";

const roleOptions = [
    { value: "admin", label: "Administrador" },
    { value: "manager", label: "Gerente" },
    { value: "barber", label: "Barbeiro" },
    { value: "reception", label: "Recepção" },
];

const roleLabelMap = {
    admin: "Administrador",
    manager: "Gerente",
    barber: "Barbeiro",
    receptionist: "Recepção",
    reception: "Recepção",
};

const weekdayOptions = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda" },
    { value: 2, label: "Terça" },
    { value: 3, label: "Quarta" },
    { value: 4, label: "Quinta" },
    { value: 5, label: "Sexta" },
    { value: 6, label: "Sábado" },
];

const weekdayLabelMap = {
    0: "Domingo",
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
};

function getInitials(name) {
    if (!name) return "EQ";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function formatDate(value) {
    if (!value) return "Sem data";

    return new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function PageHero({ totalStaff, activeStaff, barbersCount, onCreate }) {
    return (
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
                        icon={<GroupsRoundedIcon sx={{ fontSize: 18 }} />}
                        label={`${totalStaff} profissional(is)`}
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
                            Equipe
                        </Typography>

                        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.68)" }}>
                            Gerencie profissionais, funções e disponibilidade de atendimento em um só lugar.
                        </Typography>
                    </Box>
                </Stack>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Box
                        sx={{
                            minWidth: 118,
                            px: 2,
                            py: 1.4,
                            borderRadius: 2,
                            bgcolor: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.58)", fontWeight: 800 }}>
                            Ativos
                        </Typography>
                        <Typography fontWeight={900}>{activeStaff}</Typography>
                    </Box>

                    <Box
                        sx={{
                            minWidth: 118,
                            px: 2,
                            py: 1.4,
                            borderRadius: 2,
                            bgcolor: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.58)", fontWeight: 800 }}>
                            Barbeiros
                        </Typography>
                        <Typography fontWeight={900}>{barbersCount}</Typography>
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddRoundedIcon />}
                        onClick={onCreate}
                        sx={{
                            minWidth: 198,
                            minHeight: 50,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                            bgcolor: "#d89b49",
                            color: "#17181b",
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: "#e1aa60",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Novo profissional
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}

function MetricCard({ title, value, subtitle, icon, color, bg }) {
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

function DataTableShell({ children, totalStaff }) {
    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: "0 14px 34px rgba(17,18,20,0.06)",
                border: "1px solid rgba(17,18,20,0.07)",
                bgcolor: "#fffdfa",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    px: { xs: 2, md: 2.5 },
                    py: 2,
                    borderBottom: "1px solid rgba(17,18,20,0.08)",
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={900} sx={{ color: "#17181b" }}>
                        Quadro da equipe
                    </Typography>

                    <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.56)", mt: 0.3 }}>
                        Acesse cadastro, status e disponibilidade dos profissionais.
                    </Typography>
                </Box>

                <Chip
                    icon={<BadgeRoundedIcon sx={{ fontSize: 17 }} />}
                    label={`${totalStaff} registro(s)`}
                    sx={{
                        borderRadius: 2,
                        color: "#1f6f68",
                        bgcolor: "rgba(31,111,104,0.1)",
                        fontWeight: 850,
                        "& .MuiChip-icon": { color: "#1f6f68" },
                    }}
                />
            </Box>

            {children}
        </Card>
    );
}

function StaffDialog({
    open,
    title,
    subtitle,
    submitLabel,
    isSaving,
    onClose,
    onSubmit,
    formError,
    name,
    setName,
    role,
    setRole,
    phone,
    setPhone,
    isActive,
    setIsActive,
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    bgcolor: "#fffdfa",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle sx={{ p: 0, bgcolor: "#17181b", color: "#fff" }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2.5 }}>
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
                        <PersonRoundedIcon />
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={900}>
                            {title}
                        </Typography>

                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                            {subtitle}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <Box component="form" onSubmit={onSubmit}>
                <DialogContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack spacing={2}>
                        {formError && <Alert severity="error">{formError}</Alert>}

                        <TextField
                            label="Nome"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonRoundedIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                                gap: 2,
                            }}
                        >
                            <TextField
                                select
                                label="Cargo"
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                                required
                                fullWidth
                            >
                                {roleOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Telefone"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: "rgba(17,18,20,0.035)",
                                border: "1px solid rgba(17,18,20,0.08)",
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isActive}
                                        onChange={(event) => setIsActive(event.target.checked)}
                                    />
                                }
                                label="Profissional ativo"
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: "1px solid rgba(17,18,20,0.08)",
                    }}
                >
                    <Button
                        onClick={onClose}
                        disabled={isSaving}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSaving}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 850 }}
                    >
                        {isSaving ? "Salvando..." : submitLabel}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default function StaffPage() {
    const { barbershop } = useAuth();
    const queryClient = useQueryClient();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);

    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedAvailability, setSelectedAvailability] = useState(null);

    const [name, setName] = useState("");
    const [role, setRole] = useState("barber");
    const [phone, setPhone] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [formError, setFormError] = useState("");

    const [availabilityWeekday, setAvailabilityWeekday] = useState(1);
    const [availabilityStartTime, setAvailabilityStartTime] = useState("09:00");
    const [availabilityEndTime, setAvailabilityEndTime] = useState("18:00");
    const [availabilityIsActive, setAvailabilityIsActive] = useState(true);
    const [availabilityError, setAvailabilityError] = useState("");

    const {
        data: staff = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["staff", barbershop?.id],
        queryFn: () => getStaff(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const {
        data: availability = [],
        isLoading: isLoadingAvailability,
    } = useQuery({
        queryKey: ["staff-availability", selectedStaff?.id],
        queryFn: () => getStaffAvailability(selectedStaff.id),
        enabled: !!selectedStaff?.id && openAvailabilityModal,
    });

    const createStaffMutation = useMutation({
        mutationFn: createStaffRecord,
        onSuccess: async () => {
            handleCloseCreateModal();
            await queryClient.invalidateQueries({ queryKey: ["staff", barbershop?.id] });
            await queryClient.refetchQueries({ queryKey: ["staff", barbershop?.id] });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao criar profissional.");
        },
    });

    const updateStaffMutation = useMutation({
        mutationFn: updateStaffRecord,
        onSuccess: async () => {
            handleCloseEditModal();
            await queryClient.invalidateQueries({ queryKey: ["staff", barbershop?.id] });
            await queryClient.refetchQueries({ queryKey: ["staff", barbershop?.id] });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao atualizar profissional.");
        },
    });

    const deleteStaffMutation = useMutation({
        mutationFn: deleteStaffRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["staff", barbershop?.id] });
            await queryClient.refetchQueries({ queryKey: ["staff", barbershop?.id] });
        },
    });

    const createAvailabilityMutation = useMutation({
        mutationFn: createStaffAvailabilityRecord,
        onSuccess: async () => {
            resetAvailabilityForm();
            await queryClient.invalidateQueries({ queryKey: ["staff-availability", selectedStaff?.id] });
            await queryClient.refetchQueries({ queryKey: ["staff-availability", selectedStaff?.id] });
        },
        onError: (mutationError) => {
            setAvailabilityError(mutationError.message || "Erro ao criar horário.");
        },
    });

    const updateAvailabilityMutation = useMutation({
        mutationFn: updateStaffAvailabilityRecord,
        onSuccess: async () => {
            resetAvailabilityForm();
            await queryClient.invalidateQueries({ queryKey: ["staff-availability", selectedStaff?.id] });
            await queryClient.refetchQueries({ queryKey: ["staff-availability", selectedStaff?.id] });
        },
        onError: (mutationError) => {
            setAvailabilityError(mutationError.message || "Erro ao atualizar horário.");
        },
    });

    const deleteAvailabilityMutation = useMutation({
        mutationFn: deleteStaffAvailabilityRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["staff-availability", selectedStaff?.id] });
            await queryClient.refetchQueries({ queryKey: ["staff-availability", selectedStaff?.id] });
        },
    });

    function resetForm() {
        setName("");
        setRole("barber");
        setPhone("");
        setIsActive(true);
        setFormError("");
        setSelectedStaff(null);
    }

    function resetAvailabilityForm() {
        setSelectedAvailability(null);
        setAvailabilityWeekday(1);
        setAvailabilityStartTime("09:00");
        setAvailabilityEndTime("18:00");
        setAvailabilityIsActive(true);
        setAvailabilityError("");
    }

    function handleOpenCreateModal() {
        resetForm();
        setOpenCreateModal(true);
    }

    function handleCloseCreateModal() {
        if (createStaffMutation.isPending) return;
        setOpenCreateModal(false);
        resetForm();
    }

    function handleOpenEditModal(staffMember) {
        setSelectedStaff(staffMember);
        setName(staffMember.name || "");
        setRole(staffMember.role || "barber");
        setPhone(staffMember.phone || "");
        setIsActive(!!staffMember.is_active);
        setFormError("");
        setOpenEditModal(true);
    }

    function handleCloseEditModal() {
        if (updateStaffMutation.isPending) return;
        setOpenEditModal(false);
        resetForm();
    }

    function handleOpenAvailabilityModal(staffMember) {
        setSelectedStaff(staffMember);
        resetAvailabilityForm();
        setOpenAvailabilityModal(true);
    }

    function handleCloseAvailabilityModal() {
        if (createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending) return;
        setOpenAvailabilityModal(false);
        resetAvailabilityForm();
    }

    function handleEditAvailability(item) {
        setSelectedAvailability(item);
        setAvailabilityWeekday(item.weekday);
        setAvailabilityStartTime(item.start_time);
        setAvailabilityEndTime(item.end_time);
        setAvailabilityIsActive(!!item.is_active);
        setAvailabilityError("");
    }

    async function handleCreateStaff(event) {
        event.preventDefault();
        setFormError("");
        await createStaffMutation.mutateAsync({
            barbershopId: barbershop.id,
            name,
            role,
            phone,
            isActive,
        });
    }

    async function handleEditStaff(event) {
        event.preventDefault();
        setFormError("");
        await updateStaffMutation.mutateAsync({
            id: selectedStaff.id,
            name,
            role,
            phone,
            isActive,
        });
    }

    async function handleDeleteStaff(staffMember) {
        const result = await Swal.fire({
            title: "Excluir profissional?",
            text: `O profissional "${staffMember.name}" será removido.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Excluir",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await deleteStaffMutation.mutateAsync(staffMember.id);
            await Swal.fire({
                title: "Profissional excluído",
                text: "O profissional foi removido com sucesso.",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (mutationError) {
            await Swal.fire({
                title: "Erro ao excluir",
                text: mutationError.message || "Não foi possível excluir o profissional.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }

    async function handleSaveAvailability(event) {
        event.preventDefault();
        setAvailabilityError("");

        if (!selectedStaff?.id) {
            setAvailabilityError("Nenhum profissional selecionado.");
            return;
        }

        const payload = {
            weekday: availabilityWeekday,
            startTime: availabilityStartTime,
            endTime: availabilityEndTime,
            isActive: availabilityIsActive,
        };

        if (selectedAvailability?.id) {
            await updateAvailabilityMutation.mutateAsync({
                id: selectedAvailability.id,
                ...payload,
            });
            return;
        }

        await createAvailabilityMutation.mutateAsync({
            staffId: selectedStaff.id,
            ...payload,
        });
    }

    async function handleDeleteAvailability(item) {
        const result = await Swal.fire({
            title: "Excluir horário?",
            text: "Esta faixa de disponibilidade será removida.",
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
            await deleteAvailabilityMutation.mutateAsync(item.id);
            await Swal.fire({
                title: "Horário excluído",
                text: "A faixa de disponibilidade foi removida com sucesso.",
                icon: "success",
                confirmButtonText: "OK",
                target: document.body,
            });
        } catch (mutationError) {
            await Swal.fire({
                title: "Erro ao excluir",
                text: mutationError.message || "Não foi possível excluir o horário.",
                icon: "error",
                confirmButtonText: "OK",
                target: document.body,
            });
        }
    }

    const summary = useMemo(() => {
        const activeStaff = staff.filter((member) => member.is_active).length;
        const inactiveStaff = staff.filter((member) => !member.is_active).length;
        const barbersCount = staff.filter((member) => member.role === "barber").length;
        const latestStaff = [...staff].sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )[0];

        return {
            totalStaff: staff.length,
            activeStaff,
            inactiveStaff,
            barbersCount,
            latestStaffDate: latestStaff?.created_at,
        };
    }, [staff]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Profissional",
                size: 270,
                Cell: ({ row }) => {
                    const staffMember = row.original;

                    return (
                        <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "rgba(31,111,104,0.12)",
                                    color: "#1f6f68",
                                    fontWeight: 900,
                                    flexShrink: 0,
                                }}
                            >
                                {getInitials(staffMember.name)}
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography fontWeight={850} noWrap sx={{ color: "#17181b" }}>
                                    {staffMember.name || "Profissional"}
                                </Typography>

                                <Typography variant="caption" sx={{ color: "rgba(17,18,20,0.52)" }}>
                                    {roleLabelMap[staffMember.role] || staffMember.role || "Sem cargo"}
                                </Typography>
                            </Box>
                        </Stack>
                    );
                },
            },
            {
                accessorKey: "role",
                header: "Cargo",
                size: 160,
                Cell: ({ cell }) => (
                    <Chip
                        size="small"
                        icon={<BadgeRoundedIcon sx={{ fontSize: 16 }} />}
                        label={roleLabelMap[cell.getValue()] || cell.getValue() || "Sem cargo"}
                        sx={{
                            borderRadius: 2,
                            bgcolor: "rgba(196,138,63,0.14)",
                            color: "#7a4f1f",
                            fontWeight: 800,
                            "& .MuiChip-icon": { color: "#7a4f1f" },
                        }}
                    />
                ),
            },
            {
                accessorKey: "phone",
                header: "Telefone",
                size: 170,
                Cell: ({ cell }) => {
                    const value = cell.getValue();

                    if (!value) {
                        return (
                            <Chip
                                size="small"
                                label="Sem telefone"
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: "rgba(17,18,20,0.06)",
                                    color: "rgba(17,18,20,0.56)",
                                    fontWeight: 750,
                                }}
                            />
                        );
                    }

                    return (
                        <Chip
                            size="small"
                            icon={<PhoneRoundedIcon sx={{ fontSize: 16 }} />}
                            label={value}
                            sx={{
                                borderRadius: 2,
                                bgcolor: "rgba(54,95,145,0.12)",
                                color: "#365f91",
                                fontWeight: 800,
                                "& .MuiChip-icon": { color: "#365f91" },
                            }}
                        />
                    );
                },
            },
            {
                accessorKey: "is_active",
                header: "Status",
                size: 140,
                Cell: ({ cell }) =>
                    cell.getValue() ? (
                        <Chip
                            label="Ativo"
                            size="small"
                            icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                            sx={{
                                borderRadius: 2,
                                bgcolor: "rgba(31,111,104,0.1)",
                                color: "#1f6f68",
                                fontWeight: 800,
                                "& .MuiChip-icon": { color: "#1f6f68" },
                            }}
                        />
                    ) : (
                        <Chip
                            label="Inativo"
                            size="small"
                            sx={{
                                borderRadius: 2,
                                bgcolor: "rgba(17,18,20,0.06)",
                                color: "rgba(17,18,20,0.58)",
                                fontWeight: 800,
                            }}
                        />
                    ),
            },
            {
                accessorKey: "created_at",
                header: "Criado em",
                size: 150,
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.64)", fontWeight: 700 }}>
                        {formatDate(cell.getValue())}
                    </Typography>
                ),
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data: staff,
        localization: MRT_Localization_PT_BR,
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableRowActions: true,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableHiding: true,
        positionActionsColumn: "last",
        positionGlobalFilter: "left",
        initialState: {
            showGlobalFilter: true,
            showColumnFilters: false,
            density: "comfortable",
        },
        displayColumnDefOptions: {
            "mrt-row-actions": {
                header: "Ações",
                size: 140,
            },
        },
        muiSearchTextFieldProps: {
            placeholder: "Buscar profissional, cargo ou telefone",
            variant: "outlined",
            size: "small",
            InputProps: {
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchRoundedIcon />
                    </InputAdornment>
                ),
            },
            sx: {
                minWidth: { xs: "100%", sm: 360 },
                "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#fff",
                },
            },
        },
        renderTopToolbarCustomActions: () => (
            <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenCreateModal}
                sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 850,
                    bgcolor: "#17181b",
                    boxShadow: "none",
                    "&:hover": {
                        bgcolor: "#2a2b2f",
                        boxShadow: "none",
                    },
                }}
            >
                Novo profissional
            </Button>
        ),
        renderRowActions: ({ row }) => (
            <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Horários">
                    <span>
                        <IconButton
                            onClick={() => handleOpenAvailabilityModal(row.original)}
                            sx={{
                                border: "1px solid rgba(196,138,63,0.22)",
                                bgcolor: "rgba(196,138,63,0.1)",
                                color: "#7a4f1f",
                            }}
                        >
                            <AccessTimeRoundedIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Editar profissional">
                    <span>
                        <IconButton
                            onClick={() => handleOpenEditModal(row.original)}
                            sx={{
                                border: "1px solid rgba(17,18,20,0.1)",
                                bgcolor: "rgba(17,18,20,0.03)",
                            }}
                        >
                            <EditRoundedIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Excluir profissional">
                    <span>
                        <IconButton
                            color="error"
                            onClick={() => handleDeleteStaff(row.original)}
                            disabled={deleteStaffMutation.isPending}
                            sx={{
                                border: "1px solid rgba(178,59,59,0.18)",
                                bgcolor: "rgba(178,59,59,0.07)",
                            }}
                        >
                            <DeleteRoundedIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        ),
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                borderRadius: 0,
                boxShadow: "none",
                border: "none",
                width: "100%",
                bgcolor: "transparent",
            },
        },
        muiTopToolbarProps: {
            sx: {
                bgcolor: "#fffdfa",
                px: { xs: 1, md: 1.5 },
                py: 1.2,
                borderBottom: "1px solid rgba(17,18,20,0.08)",
                gap: 1,
            },
        },
        muiTableContainerProps: {
            sx: {
                maxHeight: "none",
                bgcolor: "#fffdfa",
            },
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: "rgba(17,18,20,0.035)",
                color: "rgba(17,18,20,0.66)",
                fontWeight: 900,
                borderBottom: "1px solid rgba(17,18,20,0.08)",
            },
        },
        muiTableBodyRowProps: {
            sx: {
                "&:hover td": {
                    bgcolor: "rgba(196,138,63,0.045)",
                },
            },
        },
        muiTableBodyCellProps: {
            sx: {
                borderBottom: "1px solid rgba(17,18,20,0.06)",
            },
        },
        muiBottomToolbarProps: {
            sx: {
                bgcolor: "#fffdfa",
                borderTop: "1px solid rgba(17,18,20,0.08)",
            },
        },
        state: {
            isLoading,
            showAlertBanner: isError,
            showProgressBars: isLoading,
        },
        muiToolbarAlertBannerProps: isError
            ? {
                color: "error",
                children: error.message || "Erro ao carregar equipe.",
            }
            : undefined,
    });

    if (!barbershop?.id) {
        return (
            <Alert severity="warning">
                Nenhuma barbearia encontrada para este usuário.
            </Alert>
        );
    }

    if (isLoading && staff.length === 0) {
        return (
            <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const metricCards = [
        {
            title: "Equipe",
            value: summary.totalStaff,
            subtitle: "Profissionais cadastrados",
            icon: <GroupsRoundedIcon />,
            color: "#1f6f68",
            bg: "rgba(31,111,104,0.12)",
        },
        {
            title: "Ativos",
            value: summary.activeStaff,
            subtitle: "Disponíveis para operação",
            icon: <CheckCircleRoundedIcon />,
            color: "#2f7d32",
            bg: "rgba(47,125,50,0.12)",
        },
        {
            title: "Barbeiros",
            value: summary.barbersCount,
            subtitle: "Função principal",
            icon: <PersonRoundedIcon />,
            color: "#7a4f1f",
            bg: "rgba(196,138,63,0.16)",
        },
        {
            title: "Último cadastro",
            value: summary.latestStaffDate ? formatDate(summary.latestStaffDate) : "-",
            subtitle: "Registro mais recente",
            icon: <EventAvailableRoundedIcon />,
            color: "#8c3f62",
            bg: "rgba(140,63,98,0.12)",
        },
    ];

    return (
        <>
            <Stack spacing={3} sx={{ width: "100%" }}>
                <PageHero
                    totalStaff={summary.totalStaff}
                    activeStaff={summary.activeStaff}
                    barbersCount={summary.barbersCount}
                    onCreate={handleOpenCreateModal}
                />

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
                    {metricCards.map((card) => (
                        <MetricCard key={card.title} {...card} />
                    ))}
                </Box>

                <DataTableShell totalStaff={summary.totalStaff}>
                    <MaterialReactTable table={table} />
                </DataTableShell>
            </Stack>

            <StaffDialog
                open={openCreateModal}
                title="Novo profissional"
                subtitle="Cadastre dados básicos e deixe o profissional pronto para receber horários."
                submitLabel="Salvar"
                isSaving={createStaffMutation.isPending}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateStaff}
                formError={formError}
                name={name}
                setName={setName}
                role={role}
                setRole={setRole}
                phone={phone}
                setPhone={setPhone}
                isActive={isActive}
                setIsActive={setIsActive}
            />

            <StaffDialog
                open={openEditModal}
                title="Editar profissional"
                subtitle="Atualize cadastro, função e status da equipe."
                submitLabel="Salvar alterações"
                isSaving={updateStaffMutation.isPending}
                onClose={handleCloseEditModal}
                onSubmit={handleEditStaff}
                formError={formError}
                name={name}
                setName={setName}
                role={role}
                setRole={setRole}
                phone={phone}
                setPhone={setPhone}
                isActive={isActive}
                setIsActive={setIsActive}
            />

            <Dialog
                open={openAvailabilityModal}
                onClose={handleCloseAvailabilityModal}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        bgcolor: "#fffdfa",
                        overflow: "hidden",
                        maxHeight: "calc(100vh - 32px)",
                    },
                }}
            >
                <DialogTitle sx={{ p: 0, bgcolor: "#17181b", color: "#fff" }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2.5 }}>
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
                            <AccessTimeRoundedIcon />
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={900}>
                                Horários de {selectedStaff?.name || "Profissional"}
                            </Typography>

                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                                Cadastre as faixas de disponibilidade por dia da semana.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 2, md: 2.5 }, overflowY: "auto" }}>
                    <Stack spacing={3}>
                        <Box
                            component="form"
                            onSubmit={handleSaveAvailability}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: "rgba(17,18,20,0.035)",
                                border: "1px solid rgba(17,18,20,0.08)",
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography fontWeight={900} sx={{ color: "#17181b" }}>
                                    {selectedAvailability ? "Editar faixa" : "Nova faixa"}
                                </Typography>

                                {availabilityError && <Alert severity="error">{availabilityError}</Alert>}

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            md: "1.2fr 1fr 1fr",
                                        },
                                        gap: 2,
                                    }}
                                >
                                    <TextField
                                        select
                                        label="Dia da semana"
                                        value={availabilityWeekday}
                                        onChange={(event) => setAvailabilityWeekday(Number(event.target.value))}
                                        fullWidth
                                        required
                                    >
                                        {weekdayOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    <TextField
                                        label="Início"
                                        type="time"
                                        value={availabilityStartTime}
                                        onChange={(event) => setAvailabilityStartTime(event.target.value)}
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />

                                    <TextField
                                        label="Fim"
                                        type="time"
                                        value={availabilityEndTime}
                                        onChange={(event) => setAvailabilityEndTime(event.target.value)}
                                        fullWidth
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Box>

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1.5}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "stretch", sm: "center" }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={availabilityIsActive}
                                                onChange={(event) => setAvailabilityIsActive(event.target.checked)}
                                            />
                                        }
                                        label="Faixa ativa"
                                    />

                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        {selectedAvailability && (
                                            <Button
                                                onClick={resetAvailabilityForm}
                                                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                                            >
                                                Cancelar edição
                                            </Button>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={
                                                createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending
                                            }
                                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 850 }}
                                        >
                                            {createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending
                                                ? "Salvando..."
                                                : selectedAvailability
                                                    ? "Salvar alterações"
                                                    : "Adicionar horário"}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={900} sx={{ mb: 2, color: "#17181b" }}>
                                Disponibilidade cadastrada
                            </Typography>

                            {isLoadingAvailability ? (
                                <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : availability.length === 0 ? (
                                <Alert severity="info">
                                    Nenhuma faixa de disponibilidade cadastrada para este profissional.
                                </Alert>
                            ) : (
                                <Stack spacing={1.5}>
                                    {availability.map((item) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                p: 2,
                                                border: "1px solid rgba(17,18,20,0.08)",
                                                borderRadius: 2,
                                                bgcolor: "rgba(247,244,238,0.62)",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: { xs: "flex-start", sm: "center" },
                                                flexDirection: { xs: "column", sm: "row" },
                                                gap: 2,
                                            }}
                                        >
                                            <Stack direction="row" spacing={1.4} alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: 2,
                                                        display: "grid",
                                                        placeItems: "center",
                                                        bgcolor: "rgba(196,138,63,0.16)",
                                                        color: "#7a4f1f",
                                                    }}
                                                >
                                                    <AccessTimeRoundedIcon />
                                                </Box>

                                                <Box>
                                                    <Typography fontWeight={900}>
                                                        {weekdayLabelMap[item.weekday]}
                                                    </Typography>

                                                    <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.58)" }}>
                                                        {item.start_time} às {item.end_time}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                                {item.is_active ? (
                                                    <Chip
                                                        label="Ativo"
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 2,
                                                            bgcolor: "rgba(31,111,104,0.1)",
                                                            color: "#1f6f68",
                                                            fontWeight: 800,
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Inativo"
                                                        size="small"
                                                        sx={{
                                                            borderRadius: 2,
                                                            bgcolor: "rgba(17,18,20,0.06)",
                                                            color: "rgba(17,18,20,0.58)",
                                                            fontWeight: 800,
                                                        }}
                                                    />
                                                )}

                                                <Button
                                                    size="small"
                                                    onClick={() => handleEditAvailability(item)}
                                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                                                >
                                                    Editar
                                                </Button>

                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteAvailability(item)}
                                                    disabled={deleteAvailabilityMutation.isPending}
                                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                                                >
                                                    Excluir
                                                </Button>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: "1px solid rgba(17,18,20,0.08)",
                    }}
                >
                    <Button
                        onClick={handleCloseAvailabilityModal}
                        sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                    >
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
