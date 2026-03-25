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
import { getServices } from "../../features/services/api/getServices.jsx";
import { createServiceRecord } from "../../features/services/api/createService.jsx";
import { updateServiceRecord } from "../../features/services/api/updateService.jsx";
import { deleteServiceRecord } from "../../features/services/api/deleteService.jsx";

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

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Serviço",
            },
            {
                accessorKey: "duration_minutes",
                header: "Duração",
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return value ? `${value} min` : "—";
                },
            },
            {
                accessorKey: "price",
                header: "Preço",
                Cell: ({ cell }) => {
                    const value = cell.getValue();

                    if (value === null || value === undefined) return "—";

                    return Number(value).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    });
                },
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
        data: services,
        localization: MRT_Localization_PT_BR,
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableRowActions: true,
        positionActionsColumn: "last",
        positionGlobalFilter: "left",
        initialState: {
            showGlobalFilter: true,
            showColumnFilters: false,
        },
        renderTopToolbarCustomActions: () => (
            <Button variant="contained" onClick={handleOpenCreateModal}>
                Novo serviço
            </Button>
        ),
        renderRowActions: ({ row }) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => handleOpenEditModal(row.original)}>
                    <EditRoundedIcon />
                </IconButton>

                <IconButton
                    color="error"
                    onClick={() => handleDeleteService(row.original)}
                    disabled={deleteServiceMutation.isPending}
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

    return (
        <>
            <Stack spacing={2} sx={{ width: "100%" }}>
                <Typography variant="h4" fontWeight={700}>
                    Serviços
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Total de serviços: {services.length}
                </Typography>

                <MaterialReactTable table={table} />
            </Stack>

            <Dialog
                open={openCreateModal}
                onClose={handleCloseCreateModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Novo serviço</DialogTitle>

                <Box component="form" onSubmit={handleCreateService}>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {formError && <Alert severity="error">{formError}</Alert>}

                            <TextField
                                label="Nome do serviço"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Duração (min)"
                                type="number"
                                value={durationMinutes}
                                onChange={(event) => setDurationMinutes(event.target.value)}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Preço"
                                type="number"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                required
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={handleCloseCreateModal}
                            disabled={createServiceMutation.isPending}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createServiceMutation.isPending}
                        >
                            {createServiceMutation.isPending ? "Salvando..." : "Salvar"}
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
                <DialogTitle>Editar serviço</DialogTitle>

                <Box component="form" onSubmit={handleEditService}>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {formError && <Alert severity="error">{formError}</Alert>}

                            <TextField
                                label="Nome do serviço"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Duração (min)"
                                type="number"
                                value={durationMinutes}
                                onChange={(event) => setDurationMinutes(event.target.value)}
                                required
                                fullWidth
                            />

                            <TextField
                                label="Preço"
                                type="number"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                required
                                fullWidth
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={handleCloseEditModal}
                            disabled={updateServiceMutation.isPending}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={updateServiceMutation.isPending}
                        >
                            {updateServiceMutation.isPending ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
}