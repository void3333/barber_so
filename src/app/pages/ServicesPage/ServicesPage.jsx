import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth.js";
import { getServices } from "../../features/services/api/getServices.jsx";
import { createServiceRecord } from "../../features/services/api/createService.jsx";
import { updateServiceRecord } from "../../features/services/api/updateService.jsx";
import { deleteServiceRecord } from "../../features/services/api/deleteService.jsx";
import { DataTableShell, MetricCard } from "../../components/common/ManagementPage.jsx";

function formatCurrency(value) {
    if (value === null || value === undefined || value === "") return "-";

    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatDate(value) {
    if (!value) return "Sem data";

    return new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function PageHero({ totalServices, averageDuration, averagePrice, onCreate }) {
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
                        icon={<ContentCutRoundedIcon sx={{ fontSize: 18 }} />}
                        label={`${totalServices} serviço(s)`}
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
                            Serviços
                        </Typography>

                        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.68)" }}>
                            Padronize o catálogo da barbearia com duração, preço e leitura rápida para o time.
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
                            minWidth: 126,
                            px: 2,
                            py: 1.4,
                            borderRadius: 2,
                            bgcolor: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.58)", fontWeight: 800 }}>
                            Duração média
                        </Typography>
                        <Typography fontWeight={900}>{averageDuration ? `${averageDuration} min` : "-"}</Typography>
                    </Box>

                    <Box
                        sx={{
                            minWidth: 126,
                            px: 2,
                            py: 1.4,
                            borderRadius: 2,
                            bgcolor: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.58)", fontWeight: 800 }}>
                            Preço médio
                        </Typography>
                        <Typography fontWeight={900}>{averagePrice ? formatCurrency(averagePrice) : "-"}</Typography>
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddRoundedIcon />}
                        onClick={onCreate}
                        sx={{
                            minWidth: 176,
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
                        Novo serviço
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}

function ServiceDialog({
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
    durationMinutes,
    setDurationMinutes,
    price,
    setPrice,
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
                        <ContentCutRoundedIcon />
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
                            label="Nome do serviço"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ContentCutRoundedIcon />
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
                                label="Duração (min)"
                                type="number"
                                value={durationMinutes}
                                onChange={(event) => setDurationMinutes(event.target.value)}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTimeRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Preço"
                                type="number"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AttachMoneyRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
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

export default function ServicesPage() {
    const { barbershop } = useAuth();
    const queryClient = useQueryClient();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const [name, setName] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [price, setPrice] = useState("");
    const [formError, setFormError] = useState("");

    const {
        data: services = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["services", barbershop?.id],
        queryFn: () => getServices(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const createServiceMutation = useMutation({
        mutationFn: createServiceRecord,
        onSuccess: async () => {
            handleCloseCreateModal();

            await queryClient.invalidateQueries({
                queryKey: ["services", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["services", barbershop?.id],
            });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao criar serviço.");
        },
    });

    const updateServiceMutation = useMutation({
        mutationFn: updateServiceRecord,
        onSuccess: async () => {
            handleCloseEditModal();

            await queryClient.invalidateQueries({
                queryKey: ["services", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["services", barbershop?.id],
            });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao atualizar serviço.");
        },
    });

    const deleteServiceMutation = useMutation({
        mutationFn: deleteServiceRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["services", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["services", barbershop?.id],
            });
        },
    });

    function resetForm() {
        setName("");
        setDurationMinutes("");
        setPrice("");
        setFormError("");
        setSelectedService(null);
    }

    function handleOpenCreateModal() {
        resetForm();
        setOpenCreateModal(true);
    }

    function handleCloseCreateModal() {
        if (createServiceMutation.isPending) return;

        setOpenCreateModal(false);
        resetForm();
    }

    function handleOpenEditModal(service) {
        setSelectedService(service);
        setName(service.name || "");
        setDurationMinutes(service.duration_minutes?.toString() || "");
        setPrice(service.price?.toString() || "");
        setFormError("");
        setOpenEditModal(true);
    }

    function handleCloseEditModal() {
        if (updateServiceMutation.isPending) return;

        setOpenEditModal(false);
        resetForm();
    }

    async function handleCreateService(event) {
        event.preventDefault();
        setFormError("");

        await createServiceMutation.mutateAsync({
            barbershopId: barbershop.id,
            name,
            durationMinutes,
            price,
        });
    }

    async function handleEditService(event) {
        event.preventDefault();
        setFormError("");

        await updateServiceMutation.mutateAsync({
            id: selectedService.id,
            name,
            durationMinutes,
            price,
        });
    }

    async function handleDeleteService(service) {
        const result = await Swal.fire({
            title: "Excluir serviço?",
            text: `O serviço "${service.name}" será removido.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Excluir",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await deleteServiceMutation.mutateAsync(service.id);

            await Swal.fire({
                title: "Serviço excluído",
                text: "O serviço foi removido com sucesso.",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (mutationError) {
            await Swal.fire({
                title: "Erro ao excluir",
                text: mutationError.message || "Não foi possível excluir o serviço.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }

    const summary = useMemo(() => {
        const durations = services
            .map((service) => Number(service.duration_minutes))
            .filter((value) => Number.isFinite(value) && value > 0);
        const prices = services
            .map((service) => Number(service.price))
            .filter((value) => Number.isFinite(value) && value >= 0);
        const latestService = [...services].sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )[0];

        const averageDuration = durations.length
            ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
            : 0;
        const averagePrice = prices.length
            ? prices.reduce((sum, value) => sum + value, 0) / prices.length
            : 0;

        return {
            totalServices: services.length,
            averageDuration,
            averagePrice,
            latestServiceDate: latestService?.created_at,
        };
    }, [services]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Serviço",
                size: 280,
                Cell: ({ row }) => {
                    const service = row.original;

                    return (
                        <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "rgba(196,138,63,0.16)",
                                    color: "#7a4f1f",
                                    flexShrink: 0,
                                }}
                            >
                                <ContentCutRoundedIcon />
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography fontWeight={850} noWrap sx={{ color: "#17181b" }}>
                                    {service.name || "Serviço"}
                                </Typography>

                                <Typography variant="caption" sx={{ color: "rgba(17,18,20,0.52)" }}>
                                    Item do catálogo
                                </Typography>
                            </Box>
                        </Stack>
                    );
                },
            },
            {
                accessorKey: "duration_minutes",
                header: "Duração",
                size: 150,
                Cell: ({ cell }) => {
                    const value = cell.getValue();

                    return (
                        <Chip
                            size="small"
                            icon={<AccessTimeRoundedIcon sx={{ fontSize: 16 }} />}
                            label={value ? `${value} min` : "Sem duração"}
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
                accessorKey: "price",
                header: "Preço",
                size: 160,
                Cell: ({ cell }) => (
                    <Chip
                        size="small"
                        icon={<AttachMoneyRoundedIcon sx={{ fontSize: 16 }} />}
                        label={formatCurrency(cell.getValue())}
                        sx={{
                            borderRadius: 2,
                            bgcolor: "rgba(31,111,104,0.1)",
                            color: "#1f6f68",
                            fontWeight: 800,
                            "& .MuiChip-icon": { color: "#1f6f68" },
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
        data: services,
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
                size: 100,
            },
        },
        muiSearchTextFieldProps: {
            placeholder: "Buscar serviço, preço ou duração",
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
                Novo serviço
            </Button>
        ),
        renderRowActions: ({ row }) => (
            <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Editar serviço">
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

                <Tooltip title="Excluir serviço">
                    <span>
                        <IconButton
                            color="error"
                            onClick={() => handleDeleteService(row.original)}
                            disabled={deleteServiceMutation.isPending}
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
                children: error.message || "Erro ao carregar serviços.",
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

    if (isLoading && services.length === 0) {
        return (
            <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const metricCards = [
        {
            title: "Serviços",
            value: summary.totalServices,
            subtitle: "Catálogo cadastrado",
            icon: <ContentCutRoundedIcon />,
            color: "#7a4f1f",
            bg: "rgba(196,138,63,0.16)",
        },
        {
            title: "Duração média",
            value: summary.averageDuration ? `${summary.averageDuration} min` : "-",
            subtitle: "Tempo por atendimento",
            icon: <AccessTimeRoundedIcon />,
            color: "#365f91",
            bg: "rgba(54,95,145,0.12)",
        },
        {
            title: "Preço médio",
            value: summary.averagePrice ? formatCurrency(summary.averagePrice) : "-",
            subtitle: "Ticket sugerido",
            icon: <AttachMoneyRoundedIcon />,
            color: "#1f6f68",
            bg: "rgba(31,111,104,0.12)",
        },
        {
            title: "Último cadastro",
            value: summary.latestServiceDate ? formatDate(summary.latestServiceDate) : "-",
            subtitle: "Registro mais recente",
            icon: <EventRoundedIcon />,
            color: "#8c3f62",
            bg: "rgba(140,63,98,0.12)",
        },
    ];

    return (
        <>
            <Stack spacing={3} sx={{ width: "100%" }}>
                <PageHero
                    totalServices={summary.totalServices}
                    averageDuration={summary.averageDuration}
                    averagePrice={summary.averagePrice}
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

                <DataTableShell
                    title="Catalogo de servicos"
                    subtitle="Edite preco, duracao e mantenha os servicos prontos para a agenda."
                    count={summary.totalServices}
                    accent="amber"
                >
                    <MaterialReactTable table={table} />
                </DataTableShell>
            </Stack>

            <ServiceDialog
                open={openCreateModal}
                title="Novo serviço"
                subtitle="Defina nome, duração e preço para liberar na agenda."
                submitLabel="Salvar"
                isSaving={createServiceMutation.isPending}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateService}
                formError={formError}
                name={name}
                setName={setName}
                durationMinutes={durationMinutes}
                setDurationMinutes={setDurationMinutes}
                price={price}
                setPrice={setPrice}
            />

            <ServiceDialog
                open={openEditModal}
                title="Editar serviço"
                subtitle="Atualize os detalhes do serviço no catálogo."
                submitLabel="Salvar alterações"
                isSaving={updateServiceMutation.isPending}
                onClose={handleCloseEditModal}
                onSubmit={handleEditService}
                formError={formError}
                name={name}
                setName={setName}
                durationMinutes={durationMinutes}
                setDurationMinutes={setDurationMinutes}
                price={price}
                setPrice={setPrice}
            />
        </>
    );
}
