import {useMemo, useState} from "react";
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
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {MaterialReactTable, useMaterialReactTable} from "material-react-table";
import {MRT_Localization_PT_BR} from "material-react-table/locales/pt-BR";
import Swal from "sweetalert2";
import {useAuth} from "../../hooks/useAuth.js";
import {getStaff} from "../../features/staff/api/getStaff.jsx";
import {createStaffRecord} from "../../features/staff/api/createStaff.jsx";
import {updateStaffRecord} from "../../features/staff/api/updateStaff.jsx";
import {deleteStaffRecord} from "../../features/staff/api/deleteStaff.jsx";
import {getStaffAvailability} from "../../features/staffAvailability/api/getStaffAvailability.jsx";
import {createStaffAvailabilityRecord} from "../../features/staffAvailability/api/createStaffAvailability.jsx";
import {updateStaffAvailabilityRecord} from "../../features/staffAvailability/api/updateStaffAvailability.jsx";
import {deleteStaffAvailabilityRecord} from "../../features/staffAvailability/api/deleteStaffAvailability.jsx";

const roleOptions = [
    {value: "admin", label: "Administrador"},
    {value: "manager", label: "Gerente"},
    {value: "barber", label: "Barbeiro"},
    {value: "reception", label: "Recepção"},
];

const roleLabelMap = {
    admin: "Administrador",
    manager: "Gerente",
    barber: "Barbeiro",
    receptionist: "Recepção",
    reception: "Recepção",
};

const weekdayOptions = [
    {value: 0, label: "Domingo"},
    {value: 1, label: "Segunda"},
    {value: 2, label: "Terça"},
    {value: 3, label: "Quarta"},
    {value: 4, label: "Quinta"},
    {value: 5, label: "Sexta"},
    {value: 6, label: "Sábado"},
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

export default function StaffPage() {
    const {barbershop} = useAuth();
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

            await queryClient.invalidateQueries({
                queryKey: ["staff", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["staff", barbershop?.id],
            });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao criar profissional.");
        },
    });

    const updateStaffMutation = useMutation({
        mutationFn: updateStaffRecord,
        onSuccess: async () => {
            handleCloseEditModal();

            await queryClient.invalidateQueries({
                queryKey: ["staff", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["staff", barbershop?.id],
            });
        },
        onError: (mutationError) => {
            setFormError(mutationError.message || "Erro ao atualizar profissional.");
        },
    });

    const deleteStaffMutation = useMutation({
        mutationFn: deleteStaffRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["staff", barbershop?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["staff", barbershop?.id],
            });
        },
    });

    const createAvailabilityMutation = useMutation({
        mutationFn: createStaffAvailabilityRecord,
        onSuccess: async () => {
            resetAvailabilityForm();

            await queryClient.invalidateQueries({
                queryKey: ["staff-availability", selectedStaff?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["staff-availability", selectedStaff?.id],
            });
        },
        onError: (mutationError) => {
            setAvailabilityError(mutationError.message || "Erro ao criar horário.");
        },
    });

    const updateAvailabilityMutation = useMutation({
        mutationFn: updateStaffAvailabilityRecord,
        onSuccess: async () => {
            resetAvailabilityForm();

            await queryClient.invalidateQueries({
                queryKey: ["staff-availability", selectedStaff?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["staff-availability", selectedStaff?.id],
            });
        },
        onError: (mutationError) => {
            setAvailabilityError(mutationError.message || "Erro ao atualizar horário.");
        },
    });

    const deleteAvailabilityMutation = useMutation({
        mutationFn: deleteStaffAvailabilityRecord,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["staff-availability", selectedStaff?.id],
            });

            await queryClient.refetchQueries({
                queryKey: ["staff-availability", selectedStaff?.id],
            });
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
                text: mutationError.message || "Não foi possível excluir o horário.",
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

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nome",
            },
            {
                accessorKey: "role",
                header: "Cargo",
                Cell: ({cell}) => roleLabelMap[cell.getValue()] || cell.getValue() || "—",
            },
            {
                accessorKey: "phone",
                header: "Telefone",
                Cell: ({cell}) => cell.getValue() || "—",
            },
            {
                accessorKey: "is_active",
                header: "Status",
                Cell: ({cell}) =>
                    cell.getValue() ? (
                        <Chip label="Ativo" color="success" size="small" variant="outlined"/>
                    ) : (
                        <Chip label="Inativo" color="default" size="small" variant="outlined"/>
                    ),
            },
            {
                accessorKey: "created_at",
                header: "Criado em",
                Cell: ({cell}) => {
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
        data: staff,
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
                Novo profissional
            </Button>
        ),
        renderRowActions: ({row}) => (
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <IconButton onClick={() => handleOpenAvailabilityModal(row.original)}>
                    <AccessTimeRoundedIcon/>
                </IconButton>

                <IconButton onClick={() => handleOpenEditModal(row.original)}>
                    <EditRoundedIcon/>
                </IconButton>

                <IconButton
                    color="error"
                    onClick={() => handleDeleteStaff(row.original)}
                    disabled={deleteStaffMutation.isPending}
                >
                    <DeleteRoundedIcon/>
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
            <Box sx={{display: "grid", placeItems: "center", py: 6}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <>
            <Stack spacing={2} sx={{width: "100%"}}>
                <Typography variant="h4" fontWeight={700}>
                    Equipe
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Total de profissionais: {staff.length}
                </Typography>

                <MaterialReactTable table={table}/>
            </Stack>

            <Dialog
                open={openCreateModal}
                onClose={handleCloseCreateModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Novo profissional</DialogTitle>

                <Box component="form" onSubmit={handleCreateStaff}>
                    <DialogContent>
                        <Stack spacing={2} sx={{mt: 1}}>
                            {formError && <Alert severity="error">{formError}</Alert>}

                            <TextField
                                label="Nome"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                fullWidth
                            />

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
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isActive}
                                        onChange={(event) => setIsActive(event.target.checked)}
                                    />
                                }
                                label="Profissional ativo"
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{px: 3, pb: 3}}>
                        <Button
                            onClick={handleCloseCreateModal}
                            disabled={createStaffMutation.isPending}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createStaffMutation.isPending}
                        >
                            {createStaffMutation.isPending ? "Salvando..." : "Salvar"}
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
                <DialogTitle>Editar profissional</DialogTitle>

                <Box component="form" onSubmit={handleEditStaff}>
                    <DialogContent>
                        <Stack spacing={2} sx={{mt: 1}}>
                            {formError && <Alert severity="error">{formError}</Alert>}

                            <TextField
                                label="Nome"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                fullWidth
                            />

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
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isActive}
                                        onChange={(event) => setIsActive(event.target.checked)}
                                    />
                                }
                                label="Profissional ativo"
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{px: 3, pb: 3}}>
                        <Button
                            onClick={handleCloseEditModal}
                            disabled={updateStaffMutation.isPending}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={updateStaffMutation.isPending}
                        >
                            {updateStaffMutation.isPending ? "Salvando..." : "Salvar alterações"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={openAvailabilityModal}
                onClose={handleCloseAvailabilityModal}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Horários de {selectedStaff?.name || "Profissional"}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{mt: 1}}>
                        <Box
                            component="form"
                            onSubmit={handleSaveAvailability}
                            sx={{
                                p: 2,
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 2,
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography fontWeight={700}>
                                    {selectedAvailability ? "Editar faixa" : "Nova faixa"}
                                </Typography>

                                {availabilityError && <Alert severity="error">{availabilityError}</Alert>}

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

                                <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                                    <TextField
                                        label="Início"
                                        type="time"
                                        value={availabilityStartTime}
                                        onChange={(event) => setAvailabilityStartTime(event.target.value)}
                                        fullWidth
                                        required
                                        InputLabelProps={{shrink: true}}
                                    />

                                    <TextField
                                        label="Fim"
                                        type="time"
                                        value={availabilityEndTime}
                                        onChange={(event) => setAvailabilityEndTime(event.target.value)}
                                        fullWidth
                                        required
                                        InputLabelProps={{shrink: true}}
                                    />
                                </Stack>

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
                                        <Button onClick={resetAvailabilityForm}>
                                            Cancelar edição
                                        </Button>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={
                                            createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending
                                        }
                                    >
                                        {createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending
                                            ? "Salvando..."
                                            : selectedAvailability
                                                ? "Salvar alterações"
                                                : "Adicionar horário"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="h6" fontWeight={700} sx={{mb: 2}}>
                                Disponibilidade cadastrada
                            </Typography>

                            {isLoadingAvailability ? (
                                <Box sx={{display: "grid", placeItems: "center", py: 4}}>
                                    <CircularProgress/>
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
                                                border: 1,
                                                borderColor: "divider",
                                                borderRadius: 2,
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 2,
                                            }}
                                        >
                                            <Box>
                                                <Typography fontWeight={700}>
                                                    {weekdayLabelMap[item.weekday]}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary">
                                                    {item.start_time} → {item.end_time}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {item.is_active ? (
                                                    <Chip label="Ativo" size="small" color="success"
                                                          variant="outlined"/>
                                                ) : (
                                                    <Chip label="Inativo" size="small" variant="outlined"/>
                                                )}

                                                <Button size="small" onClick={() => handleEditAvailability(item)}>
                                                    Editar
                                                </Button>

                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteAvailability(item)}
                                                    disabled={deleteAvailabilityMutation.isPending}
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

                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button onClick={handleCloseAvailabilityModal}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}