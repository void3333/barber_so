import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_PT_BR } from "material-react-table/locales/pt-BR";
import Swal from "sweetalert2";
import { useAuth } from "../../hooks/useAuth.js";
import { getClients } from "../../features/clients/api/getClients.jsx";
import { updateClientRecord } from "../../features/clients/api/updateClient.jsx";
import { createClientRecord } from "../../features/clients/api/createClient.jsx";
import { deleteClientRecord } from "../../features/clients/api/deleteClient.jsx";

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

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nome",
            },
            {
                accessorKey: "phone",
                header: "Telefone",
                Cell: ({ cell }) => cell.getValue() || "—",
            },
            {
                accessorKey: "notes",
                header: "Observações",
                Cell: ({ cell }) => cell.getValue() || "—",
            },
            {
                accessorKey: "created_at",
                header: "Criado em",
                Cell: ({ cell }) => {
                    const value = cell.getValue();

                    if (!value) return "—";

                    return new Date(value).toLocaleDateString("pt-BR");
                },
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
        positionActionsColumn: "last",
        positionGlobalFilter: "left",
        initialState: {
            showGlobalFilter: true,
            showColumnFilters: false,
        },
        renderTopToolbarCustomActions: () => (
            <Button variant="contained" onClick={handleOpenCreateModal}>
                Novo cliente
            </Button>
        ),
        renderRowActions: ({ row }) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => handleOpenEditModal(row.original)}>
                    <EditRoundedIcon />
                </IconButton>

                <IconButton
                    color="error"
                    onClick={() => handleDeleteClient(row.original)}
                    disabled={deleteClientMutation.isPending}
                >
                    <DeleteRoundedIcon />
                </IconButton>
            </Box>
        ),
        muiTablePaperProps: {
            elevation: 0,
            sx: {
                borderRadius: 0,
                boxShadow: "none",
                border: "none",
                width: "100%",
            },
        },
        muiTableContainerProps: {
            sx: {
                maxHeight: "none",
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

    return (
        <>
            <Stack spacing={2} sx={{ width: "100%" }}>
                <Typography variant="h4" fontWeight={700}>
                    Clientes
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Total de clientes: {clients.length}
                </Typography>

                <MaterialReactTable table={table} />
            </Stack>

            <Dialog
                open={openCreateModal}
                onClose={handleCloseCreateModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Novo cliente</DialogTitle>

                <Box component="form" onSubmit={handleCreateClient}>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {formError && <Alert severity="error">{formError}</Alert>}

                            <TextField
                                label="Nome"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Telefone"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                fullWidth
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

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={handleCloseCreateModal}
                            disabled={createClientMutation.isPending}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createClientMutation.isPending}
                        >
                            {createClientMutation.isPending ? "Salvando..." : "Salvar"}
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
                <DialogTitle>Editar cliente</DialogTitle>

                <Box component="form" onSubmit={handleEditClient}>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {formError && <Alert severity="error">{formError}</Alert>}

                            <TextField
                                label="Nome"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Telefone"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                fullWidth
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

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={handleCloseEditModal}
                            disabled={updateClientMutation.isPending}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={updateClientMutation.isPending}
                        >
                            {updateClientMutation.isPending ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
}