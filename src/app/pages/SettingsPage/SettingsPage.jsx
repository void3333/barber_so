import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    InputAdornment,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { getDashboardOverview } from "../../features/dashboard/api/getDashboardOverview.jsx";
import { getClients } from "../../features/clients/api/getClients.jsx";
import { getServices } from "../../features/services/api/getServices.jsx";
import { getStaff } from "../../features/staff/api/getStaff.jsx";
import { updateBarbershopSettings } from "../../features/settings/api/updateBarbershopSettings.js";
import { updateProfileSettings } from "../../features/settings/api/updateProfileSettings.js";
import { MetricCard } from "../../components/common/ManagementPage.jsx";

const roleLabelMap = {
    admin: "Administrador",
    manager: "Gerente",
    barber: "Barbeiro",
    receptionist: "Recepcao",
    reception: "Recepcao",
};

const planMetaMap = {
    starter: {
        label: "Starter",
        price: "R$ 49/mes",
        limit: "Operacao inicial",
    },
    pro: {
        label: "Profissional",
        price: "R$ 99/mes",
        limit: "Agenda e equipe em crescimento",
    },
    premium: {
        label: "Premium",
        price: "R$ 149/mes",
        limit: "Operacao completa",
    },
};

const statusMetaMap = {
    scheduled: {
        label: "Agendados",
        color: "#7a4f1f",
        bg: "rgba(196,138,63,0.14)",
    },
    confirmed: {
        label: "Confirmados",
        color: "#1f6f68",
        bg: "rgba(31,111,104,0.12)",
    },
    completed: {
        label: "Concluidos",
        color: "#2f7d32",
        bg: "rgba(47,125,50,0.12)",
    },
    cancelled: {
        label: "Cancelados",
        color: "#b23b3b",
        bg: "rgba(178,59,59,0.12)",
    },
};

function formatDate(value) {
    if (!value) return "Sem data";

    return new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function SettingsPanel({ title, subtitle, icon, children, action }) {
    return (
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
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "flex-start" }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 2,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "rgba(216,155,73,0.14)",
                                    color: "#7a4f1f",
                                    flexShrink: 0,
                                }}
                            >
                                {icon}
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={900} sx={{ color: "#17181b" }}>
                                    {title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.56)" }}>
                                    {subtitle}
                                </Typography>
                            </Box>
                        </Stack>

                        {action}
                    </Stack>

                    <Divider />

                    {children}
                </Stack>
            </CardContent>
        </Card>
    );
}

function ReadinessItem({ label, ready, detail }) {
    return (
        <Stack direction="row" spacing={1.4} alignItems="center">
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    color: ready ? "#2f7d32" : "#b23b3b",
                    bgcolor: ready ? "rgba(47,125,50,0.12)" : "rgba(178,59,59,0.1)",
                    flexShrink: 0,
                }}
            >
                {ready ? <CheckCircleRoundedIcon /> : <WarningAmberRoundedIcon />}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={850} sx={{ color: "#17181b" }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.56)" }}>
                    {detail}
                </Typography>
            </Box>
        </Stack>
    );
}

export default function SettingsPage() {
    const { user, profile, membership, barbershop, refreshAuth } = useAuth();
    const { canManageSettings } = usePermissions();
    const queryClient = useQueryClient();

    const [shopName, setShopName] = useState("");
    const [shopPhone, setShopPhone] = useState("");
    const [shopDirty, setShopDirty] = useState(false);
    const [fullName, setFullName] = useState("");
    const [profileDirty, setProfileDirty] = useState(false);
    const [shopMessage, setShopMessage] = useState("");
    const [profileMessage, setProfileMessage] = useState("");

    const visibleShopName = shopDirty ? shopName : barbershop?.name || "";
    const visibleShopPhone = shopDirty ? shopPhone : barbershop?.phone || "";
    const visibleFullName = profileDirty ? fullName : profile?.full_name || "";

    const {
        data: overview,
        isLoading: isLoadingOverview,
    } = useQuery({
        queryKey: ["dashboard-overview", barbershop?.id],
        queryFn: () => getDashboardOverview(barbershop.id),
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

    const updateShopMutation = useMutation({
        mutationFn: updateBarbershopSettings,
        onSuccess: async () => {
            await refreshAuth();
            setShopDirty(false);
            setShopMessage("Dados da barbearia salvos.");
            await queryClient.invalidateQueries({ queryKey: ["dashboard-overview", barbershop?.id] });
        },
        onError: (error) => {
            setShopMessage(error.message || "Nao foi possivel salvar os dados da barbearia.");
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: updateProfileSettings,
        onSuccess: async () => {
            await refreshAuth();
            setProfileDirty(false);
            setProfileMessage("Perfil salvo.");
        },
        onError: (error) => {
            setProfileMessage(error.message || "Nao foi possivel salvar o perfil.");
        },
    });

    const plan = planMetaMap[barbershop?.plan] || {
        label: "Sem plano",
        price: "-",
        limit: "Plano nao identificado",
    };
    const role = roleLabelMap[membership?.role] || "Sem cargo";
    const stats = overview?.stats || {};
    const statusSummary = overview?.statusSummary || {};
    const activeStaff = staff.filter((member) => member.is_active).length;
    const clientsWithPhone = clients.filter((client) => !!client.phone).length;

    const readiness = useMemo(() => {
        const items = [
            {
                label: "Clientes cadastrados",
                ready: clients.length > 0,
                detail: `${clients.length} cliente(s) na base`,
            },
            {
                label: "Catalogo de servicos",
                ready: services.length > 0,
                detail: `${services.length} servico(s) disponiveis`,
            },
            {
                label: "Equipe ativa",
                ready: activeStaff > 0,
                detail: `${activeStaff} profissional(is) ativo(s)`,
            },
            {
                label: "Contato da barbearia",
                ready: !!barbershop?.phone,
                detail: barbershop?.phone || "Telefone ainda nao informado",
            },
        ];

        return {
            items,
            score: Math.round((items.filter((item) => item.ready).length / items.length) * 100),
        };
    }, [activeStaff, barbershop?.phone, clients.length, services.length]);

    async function handleSaveShop(event) {
        event.preventDefault();
        setShopMessage("");

        if (!canManageSettings) {
            setShopMessage("Seu cargo não permite alterar dados da barbearia.");
            return;
        }

        await updateShopMutation.mutateAsync({
            id: barbershop.id,
            name: visibleShopName,
            phone: visibleShopPhone,
        });
    }

    async function handleSaveProfile(event) {
        event.preventDefault();
        setProfileMessage("");

        await updateProfileMutation.mutateAsync({
            id: user.id,
            fullName: visibleFullName,
        });
    }

    if (!barbershop?.id) {
        return (
            <Alert severity="info">
                Nenhuma barbearia encontrada para configurar.
            </Alert>
        );
    }

    return (
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
                            icon={<SettingsRoundedIcon sx={{ fontSize: 18 }} />}
                            label={barbershop?.slug || "configuracoes"}
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
                                Configuracoes
                            </Typography>

                            <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.68)" }}>
                                Ajuste identidade, perfil e acompanhe a saude operacional da barbearia.
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Box
                            sx={{
                                minWidth: 132,
                                px: 2,
                                py: 1.4,
                                borderRadius: 2,
                                bgcolor: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.58)", fontWeight: 800 }}>
                                Plano
                            </Typography>
                            <Typography fontWeight={900}>{plan.label}</Typography>
                        </Box>

                        <Box
                            sx={{
                                minWidth: 132,
                                px: 2,
                                py: 1.4,
                                borderRadius: 2,
                                bgcolor: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.58)", fontWeight: 800 }}>
                                Cargo
                            </Typography>
                            <Typography fontWeight={900}>{role}</Typography>
                        </Box>
                    </Stack>
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
                <MetricCard
                    title="Clientes"
                    value={stats.totalClients ?? clients.length}
                    subtitle={`${clientsWithPhone} com telefone`}
                    icon={<PeopleRoundedIcon />}
                    color="#1f6f68"
                    bg="rgba(31,111,104,0.12)"
                />
                <MetricCard
                    title="Servicos"
                    value={stats.totalServices ?? services.length}
                    subtitle="Catalogo operacional"
                    icon={<ContentCutRoundedIcon />}
                    color="#7a4f1f"
                    bg="rgba(196,138,63,0.14)"
                />
                <MetricCard
                    title="Equipe ativa"
                    value={activeStaff}
                    subtitle={`${staff.length} profissional(is) no total`}
                    icon={<GroupsRoundedIcon />}
                    color="#365f91"
                    bg="rgba(54,95,145,0.12)"
                />
                <MetricCard
                    title="Hoje"
                    value={stats.todayAppointments ?? 0}
                    subtitle="Agendamentos do dia"
                    icon={<EventAvailableRoundedIcon />}
                    color="#2f7d32"
                    bg="rgba(47,125,50,0.12)"
                />
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" },
                    gap: 2,
                }}
            >
                <Stack spacing={2}>
                    {!canManageSettings && (
                        <Alert severity="warning">
                            Seu cargo permite visualizar estas configurações, mas apenas administradores e gerentes podem alterar dados da barbearia.
                        </Alert>
                    )}

                    <SettingsPanel
                        title="Identidade da barbearia"
                        subtitle="Dados usados nas telas internas e na identificacao da operacao."
                        icon={<StorefrontRoundedIcon />}
                    >
                        <Box component="form" onSubmit={handleSaveShop}>
                            <Stack spacing={2}>
                                {shopMessage && (
                                    <Alert severity={updateShopMutation.isError ? "error" : "success"}>
                                        {shopMessage}
                                    </Alert>
                                )}

                                <TextField
                                    label="Nome da barbearia"
                                    value={visibleShopName}
                                    onChange={(event) => {
                                        setShopDirty(true);
                                        setShopName(event.target.value);
                                    }}
                                    required
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <StorefrontRoundedIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    label="Telefone"
                                    value={visibleShopPhone}
                                    onChange={(event) => {
                                        setShopDirty(true);
                                        setShopPhone(event.target.value);
                                    }}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneRoundedIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                                    <TextField
                                        label="Slug"
                                        value={barbershop?.slug || ""}
                                        disabled
                                        fullWidth
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveRoundedIcon />}
                                        disabled={!canManageSettings || updateShopMutation.isPending}
                                        sx={{ minHeight: 54, borderRadius: 2, textTransform: "none", fontWeight: 850 }}
                                    >
                                        {updateShopMutation.isPending ? "Salvando..." : "Salvar barbearia"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    </SettingsPanel>

                    <SettingsPanel
                        title="Perfil de acesso"
                        subtitle="Informacoes da pessoa logada e permissao atual."
                        icon={<PersonRoundedIcon />}
                    >
                        <Box component="form" onSubmit={handleSaveProfile}>
                            <Stack spacing={2}>
                                {profileMessage && (
                                    <Alert severity={updateProfileMutation.isError ? "error" : "success"}>
                                        {profileMessage}
                                    </Alert>
                                )}

                                <TextField
                                    label="Nome"
                                    value={visibleFullName}
                                    onChange={(event) => {
                                        setProfileDirty(true);
                                        setFullName(event.target.value);
                                    }}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonRoundedIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    <TextField
                                        label="Email"
                                        value={profile?.email || user?.email || ""}
                                        disabled
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AlternateEmailRoundedIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        label="Cargo"
                                        value={role}
                                        disabled
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BadgeRoundedIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Stack>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveRoundedIcon />}
                                    disabled={updateProfileMutation.isPending}
                                    sx={{ alignSelf: "flex-start", borderRadius: 2, textTransform: "none", fontWeight: 850 }}
                                >
                                    {updateProfileMutation.isPending ? "Salvando..." : "Salvar perfil"}
                                </Button>
                            </Stack>
                        </Box>
                    </SettingsPanel>
                </Stack>

                <Stack spacing={2}>
                    <SettingsPanel
                        title="Plano e operacao"
                        subtitle="Leitura rapida do pacote e maturidade do cadastro."
                        icon={<WorkspacePremiumRoundedIcon />}
                    >
                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "rgba(196,138,63,0.12)",
                                    border: "1px solid rgba(196,138,63,0.2)",
                                }}
                            >
                                <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.58)", fontWeight: 800 }}>
                                    Plano atual
                                </Typography>
                                <Typography variant="h5" fontWeight={900} sx={{ color: "#17181b", mt: 0.5 }}>
                                    {plan.label}
                                </Typography>
                                <Typography sx={{ color: "rgba(17,18,20,0.62)", mt: 0.4 }}>
                                    {plan.price} - {plan.limit}
                                </Typography>
                            </Box>

                            <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography fontWeight={900} sx={{ color: "#17181b" }}>
                                        Prontidao da operacao
                                    </Typography>
                                    <Typography fontWeight={900} sx={{ color: "#1f6f68" }}>
                                        {readiness.score}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={readiness.score}
                                    sx={{
                                        height: 10,
                                        borderRadius: 99,
                                        bgcolor: "rgba(17,18,20,0.08)",
                                        "& .MuiLinearProgress-bar": {
                                            borderRadius: 99,
                                            bgcolor: readiness.score >= 75 ? "#2f7d32" : "#d89b49",
                                        },
                                    }}
                                />
                            </Box>

                            <Stack spacing={1.5}>
                                {readiness.items.map((item) => (
                                    <ReadinessItem key={item.label} {...item} />
                                ))}
                            </Stack>
                        </Stack>
                    </SettingsPanel>

                    <SettingsPanel
                        title="Agenda em tempo real"
                        subtitle="Resumo calculado a partir dos agendamentos existentes."
                        icon={<EventAvailableRoundedIcon />}
                        action={isLoadingOverview ? <CircularProgress size={22} /> : null}
                    >
                        <Stack spacing={1.5}>
                            {Object.entries(statusMetaMap).map(([status, meta]) => (
                                <Box
                                    key={status}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: meta.bg,
                                        border: `1px solid ${meta.bg}`,
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                        <Typography fontWeight={850} sx={{ color: meta.color }}>
                                            {meta.label}
                                        </Typography>
                                        <Typography variant="h5" fontWeight={900} sx={{ color: meta.color }}>
                                            {statusSummary[status] || 0}
                                        </Typography>
                                    </Stack>
                                </Box>
                            ))}

                            <Alert severity="info">
                                Estes numeros nao ficam salvos em uma tabela extra: eles sao calculados em tempo real com base nos agendamentos da barbearia.
                            </Alert>
                        </Stack>
                    </SettingsPanel>

                    <SettingsPanel
                        title="Registro"
                        subtitle="Dados tecnicos da unidade."
                        icon={<BadgeRoundedIcon />}
                    >
                        <Stack spacing={1.3}>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography sx={{ color: "rgba(17,18,20,0.56)" }}>ID</Typography>
                                <Typography fontWeight={850} noWrap>{barbershop?.id}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography sx={{ color: "rgba(17,18,20,0.56)" }}>Criado em</Typography>
                                <Typography fontWeight={850}>{formatDate(user?.created_at)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography sx={{ color: "rgba(17,18,20,0.56)" }}>Total de agendamentos</Typography>
                                <Typography fontWeight={850}>{stats.totalAppointments || 0}</Typography>
                            </Stack>
                        </Stack>
                    </SettingsPanel>
                </Stack>
            </Box>
        </Stack>
    );
}
