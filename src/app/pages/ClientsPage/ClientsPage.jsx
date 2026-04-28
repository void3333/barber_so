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
    Divider,
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
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth.js";
import { getClients } from "../../features/clients/api/getClients.jsx";
import { updateClientRecord } from "../../features/clients/api/updateClient.jsx";
import { createClientRecord } from "../../features/clients/api/createClient.jsx";
import { deleteClientRecord } from "../../features/clients/api/deleteClient.jsx";
import { DataTableShell, MetricCard } from "../../components/common/ManagementPage.jsx";

function getInitials(name) {
    if (!name) return "CL";

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

function PageHero({ totalClients, clientsWithPhone, clientsWithNotes, onCreate }) {
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
                        icon={<PeopleRoundedIcon sx={{ fontSize: 18 }} />}
                        label={`${totalClients} cliente(s)`}
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
                            Clientes
                        </Typography>

                        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.68)" }}>
                            Organize a base de clientes, contatos e observações em uma tela clara para operação diária.
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
                            Com telefone
                        </Typography>
                        <Typography fontWeight={900}>{clientsWithPhone}</Typography>
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
                            Com notas
                        </Typography>
                        <Typography fontWeight={900}>{clientsWithNotes}</Typography>
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
                        Novo cliente
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}

function ClientDialog({
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
    phone,
    setPhone,
    notes,
    setNotes,
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

export default function ClientsPage() {
    const { barbershop } = useAuth();
    const queryClient = useQueryClient();

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState("");

    const {
        data: clients = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["clients", barbershop?.id],
        queryFn: () => getClients(barbershop.id),
        enabled: !!barbershop?.id,
    });

    const createClientMutation = useMutation({
        mutationFn: createClientRecord,
        onSuccess: async () => {
            handleCloseCreateModal();

            await queryClient.invalidateQueries({
                queryKey: ["clients", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["clients", barbershop?.id],
            });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao criar cliente.");
        },
    });

    const updateClientMutation = useMutation({
        mutationFn: updateClientRecord,
        onSuccess: async () => {
            handleCloseEditModal();

            await queryClient.invalidateQueries({
                queryKey: ["clients", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["clients", barbershop?.id],
            });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao atualizar cliente.");
        },
    });

    const deleteClientMutation = useMutation({
        mutationFn: deleteClientRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["clients", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["clients", barbershop?.id],
            });
        },
    });

    function resetForm() {
        setName("");
        setPhone("");
        setNotes("");
        setFormError("");
        setSelectedClient(null);
    }

    function handleOpenCreateModal() {
        resetForm();
        setOpenCreateModal(true);
    }

    function handleCloseCreateModal() {
        if (createClientMutation.isPending) return;

        setOpenCreateModal(false);
        resetForm();
    }

    function handleOpenEditModal(client) {
        setSelectedClient(client);
        setName(client.name || "");
        setPhone(client.phone || "");
        setNotes(client.notes || "");
        setFormError("");
        setOpenEditModal(true);
    }

    function handleCloseEditModal() {
        if (updateClientMutation.isPending) return;

        setOpenEditModal(false);
        resetForm();
    }

    async function handleCreateClient(event) {
        event.preventDefault();
        setFormError("");

        await createClientMutation.mutateAsync({
            barbershopId: barbershop.id,
            name,
            phone,
            notes,
        });
    }

    async function handleEditClient(event) {
        event.preventDefault();
        setFormError("");

        await updateClientMutation.mutateAsync({
            id: selectedClient.id,
            name,
            phone,
            notes,
        });
    }

    async function handleDeleteClient(client) {
        const result = await Swal.fire({
            title: "Excluir cliente?",
            text: `O cliente "${client.name}" será removido.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Excluir",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await deleteClientMutation.mutateAsync(client.id);

            await Swal.fire({
                title: "Cliente excluído",
                text: "O cliente foi removido com sucesso.",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (mutationError) {
            await Swal.fire({
                title: "Erro ao excluir",
                text: mutationError.message || "Não foi possível excluir o cliente.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }

    const summary = useMemo(() => {
        const clientsWithPhone = clients.filter((client) => !!client.phone).length;
        const clientsWithNotes = clients.filter((client) => !!client.notes).length;
        const latestClient = [...clients].sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        )[0];

        return {
            totalClients: clients.length,
            clientsWithPhone,
            clientsWithNotes,
            latestClientDate: latestClient?.created_at,
        };
    }, [clients]);

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Cliente",
                size: 260,
                Cell: ({ row }) => {
                    const client = row.original;

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
                                {getInitials(client.name)}
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography fontWeight={850} noWrap sx={{ color: "#17181b" }}>
                                    {client.name || "Cliente"}
                                </Typography>

                                <Typography variant="caption" sx={{ color: "rgba(17,18,20,0.52)" }}>
                                    Registro de cliente
                                </Typography>
                            </Box>
                        </Stack>
                    );
                },
            },
            {
                accessorKey: "phone",
                header: "Telefone",
                size: 180,
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
                                bgcolor: "rgba(31,111,104,0.1)",
                                color: "#1f6f68",
                                fontWeight: 800,
                                "& .MuiChip-icon": { color: "#1f6f68" },
                            }}
                        />
                    );
                },
            },
            {
                accessorKey: "notes",
                header: "Observações",
                size: 300,
                Cell: ({ cell }) => {
                    const value = cell.getValue();

                    if (!value) {
                        return (
                            <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.38)" }}>
                                Sem observações
                            </Typography>
                        );
                    }

                    return (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "rgba(17,18,20,0.7)",
                                maxWidth: 320,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {value}
                        </Typography>
                    );
                },
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
        data: clients,
        localization: MRT_Localization_PT_BR,
        enableRowActions: true,
        enableGlobalFilter: true,
        enableColumnFilters: true,
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
            placeholder: "Buscar cliente, telefone ou observação",
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
                Novo cliente
            </Button>
        ),
        renderRowActions: ({ row }) => (
            <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Editar cliente">
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

                <Tooltip title="Excluir cliente">
                    <span>
                        <IconButton
                            color="error"
                            onClick={() => handleDeleteClient(row.original)}
                            disabled={deleteClientMutation.isPending}
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
                children: error.message || "Erro ao carregar clientes.",
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

    if (isLoading && clients.length === 0) {
        return (
            <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const metricCards = [
        {
            title: "Clientes",
            value: summary.totalClients,
            subtitle: "Base cadastrada",
            icon: <PeopleRoundedIcon />,
            color: "#1f6f68",
            bg: "rgba(31,111,104,0.12)",
        },
        {
            title: "Com telefone",
            value: summary.clientsWithPhone,
            subtitle: "Contatos prontos",
            icon: <PhoneRoundedIcon />,
            color: "#365f91",
            bg: "rgba(54,95,145,0.12)",
        },
        {
            title: "Com notas",
            value: summary.clientsWithNotes,
            subtitle: "Com contexto salvo",
            icon: <NotesRoundedIcon />,
            color: "#7a4f1f",
            bg: "rgba(196,138,63,0.16)",
        },
        {
            title: "Último cadastro",
            value: summary.latestClientDate ? formatDate(summary.latestClientDate) : "-",
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
                    totalClients={summary.totalClients}
                    clientsWithPhone={summary.clientsWithPhone}
                    clientsWithNotes={summary.clientsWithNotes}
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
                    title="Base de clientes"
                    subtitle="Use busca, filtros e ordenacao para localizar registros rapidamente."
                    count={summary.totalClients}
                    accent="teal"
                >
                    <MaterialReactTable table={table} />
                </DataTableShell>
            </Stack>

            <ClientDialog
                open={openCreateModal}
                title="Novo cliente"
                subtitle="Cadastre contato e observações úteis para próximos atendimentos."
                submitLabel="Salvar"
                isSaving={createClientMutation.isPending}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateClient}
                formError={formError}
                name={name}
                setName={setName}
                phone={phone}
                setPhone={setPhone}
                notes={notes}
                setNotes={setNotes}
            />

            <ClientDialog
                open={openEditModal}
                title="Editar cliente"
                subtitle="Atualize os dados do cliente mantendo o histórico organizado."
                submitLabel="Salvar alterações"
                isSaving={updateClientMutation.isPending}
                onClose={handleCloseEditModal}
                onSubmit={handleEditClient}
                formError={formError}
                name={name}
                setName={setName}
                phone={phone}
                setPhone={setPhone}
                notes={notes}
                setNotes={setNotes}
            />
        </>
    );
}
