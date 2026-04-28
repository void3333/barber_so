import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Typography,
} from "@mui/material";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.js";
import { getDashboardOverview } from "../../features/dashboard/api/getDashboardOverview.jsx";

const statusMetaMap = {
    scheduled: {
        label: "Agendados",
        chipLabel: "Agendado",
        color: "#7a4f1f",
        bg: "rgba(196,138,63,0.14)",
    },
    confirmed: {
        label: "Confirmados",
        chipLabel: "Confirmado",
        color: "#1f6f68",
        bg: "rgba(31,111,104,0.12)",
    },
    completed: {
        label: "Concluídos",
        chipLabel: "Concluído",
        color: "#2f7d32",
        bg: "rgba(47,125,50,0.12)",
    },
    cancelled: {
        label: "Cancelados",
        chipLabel: "Cancelado",
        color: "#b23b3b",
        bg: "rgba(178,59,59,0.12)",
    },
};

const statCards = [
    {
        key: "totalClients",
        title: "Clientes",
        subtitle: "Base cadastrada",
        icon: <PeopleRoundedIcon />,
        color: "#1f6f68",
        bg: "rgba(31,111,104,0.12)",
    },
    {
        key: "totalServices",
        title: "Serviços",
        subtitle: "Catálogo ativo",
        icon: <ContentCutRoundedIcon />,
        color: "#7a4f1f",
        bg: "rgba(196,138,63,0.16)",
    },
    {
        key: "totalAppointments",
        title: "Agendamentos",
        subtitle: "Histórico geral",
        icon: <EventRoundedIcon />,
        color: "#365f91",
        bg: "rgba(54,95,145,0.12)",
    },
    {
        key: "todayAppointments",
        title: "Hoje",
        subtitle: "Agenda do dia",
        icon: <TodayRoundedIcon />,
        color: "#8c3f62",
        bg: "rgba(140,63,98,0.12)",
    },
];

const planLabelMap = {
    starter: "Starter",
    pro: "Profissional",
    premium: "Premium",
};

function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function getAppointmentDateParts(startsAt) {
    if (!startsAt) {
        return {
            date: "Sem data",
            time: "--:--",
        };
    }

    const date = new Date(startsAt);

    return {
        date: date.toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "short",
        }),
        time: date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        }),
    };
}

function StatCard({ title, value, subtitle, icon, color, bg }) {
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
            <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2.2}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
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

                        <Chip
                            size="small"
                            icon={<TrendingUpRoundedIcon sx={{ fontSize: 16 }} />}
                            label="Ativo"
                            sx={{
                                height: 26,
                                borderRadius: 2,
                                fontWeight: 800,
                                color: "#2f4f46",
                                bgcolor: "rgba(47,79,70,0.09)",
                                "& .MuiChip-icon": { color: "#2f4f46" },
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.58)", fontWeight: 700 }}>
                            {title}
                        </Typography>

                        <Typography variant="h3" fontWeight={850} sx={{ color: "#17181b", lineHeight: 1.05, mt: 0.5 }}>
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

function SectionCard({ title, subtitle, icon, action, children }) {
    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 2,
                boxShadow: "0 14px 34px rgba(17,18,20,0.06)",
                border: "1px solid rgba(17,18,20,0.07)",
                bgcolor: "#fffdfa",
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={2.5}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    display: "grid",
                                    placeItems: "center",
                                    color: "#7a4f1f",
                                    bgcolor: "rgba(196,138,63,0.14)",
                                    flexShrink: 0,
                                }}
                            >
                                {icon}
                            </Box>

                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h6" fontWeight={850} sx={{ color: "#17181b" }}>
                                    {title}
                                </Typography>

                                {subtitle && (
                                    <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.55)" }}>
                                        {subtitle}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        {action}
                    </Box>

                    {children}
                </Stack>
            </CardContent>
        </Card>
    );
}

function EmptyAppointments() {
    return (
        <Box
            sx={{
                py: 5,
                px: 2,
                borderRadius: 2,
                textAlign: "center",
                border: "1px dashed rgba(17,18,20,0.14)",
                bgcolor: "rgba(17,18,20,0.025)",
            }}
        >
            <Typography fontWeight={800} sx={{ color: "#17181b" }}>
                Agenda livre por enquanto
            </Typography>

            <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.58)", mt: 0.5 }}>
                Os próximos agendamentos aparecerão aqui assim que forem cadastrados.
            </Typography>
        </Box>
    );
}

export default function DashboardPage() {
    const { barbershop, profile } = useAuth();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["dashboard-overview", barbershop?.id],
        queryFn: () => getDashboardOverview(barbershop.id),
        enabled: !!barbershop?.id,
    });

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
                {error.message || "Erro ao carregar dashboard."}
            </Alert>
        );
    }

    const { stats, upcomingAppointments, statusSummary } = data;
    const totalAppointmentsByStatus = Object.values(statusSummary).reduce((sum, value) => sum + value, 0);
    const planName = planLabelMap[barbershop?.plan] || "Sem plano";

    return (
        <Stack spacing={3} sx={{ width: "100%" }}>
            <Box
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 2,
                    p: { xs: 2.5, md: 3 },
                    color: "#fff",
                    bgcolor: "#17181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 18px 42px rgba(17,18,20,0.14)",
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={3}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                >
                    <Stack spacing={2} sx={{ maxWidth: 640 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip
                                icon={<StorefrontRoundedIcon sx={{ fontSize: 18 }} />}
                                label={barbershop?.name || "Barbearia"}
                                sx={{
                                    width: "fit-content",
                                    borderRadius: 2,
                                    color: "#f7f4ee",
                                    bgcolor: "rgba(255,255,255,0.09)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    fontWeight: 800,
                                    "& .MuiChip-icon": { color: "#d89b49" },
                                }}
                            />

                            <Chip
                                label={`Plano ${planName}`}
                                sx={{
                                    width: "fit-content",
                                    borderRadius: 2,
                                    color: "#ffd69a",
                                    bgcolor: "rgba(216,155,73,0.14)",
                                    border: "1px solid rgba(216,155,73,0.25)",
                                    fontWeight: 800,
                                }}
                            />
                        </Stack>

                        <Box>
                            <Typography
                                variant="h4"
                                fontWeight={900}
                                sx={{ lineHeight: 1.12, color: "#fff" }}
                            >
                                Painel Geral
                            </Typography>

                            <Typography variant="body1" sx={{ mt: 1, color: "rgba(255,255,255,0.68)" }}>
                                Olá, {profile?.full_name || "usuário"}. Aqui está o pulso da sua operação hoje.
                            </Typography>
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            minWidth: { xs: "100%", md: 250 },
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
                                Agenda de hoje
                            </Typography>

                            <Stack direction="row" spacing={1.5} alignItems="flex-end">
                                <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1 }}>
                                    {stats.todayAppointments}
                                </Typography>

                                <Typography sx={{ color: "rgba(255,255,255,0.7)", pb: 0.4 }}>
                                    horário(s)
                                </Typography>
                            </Stack>

                            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.66)" }}>
                                {upcomingAppointments.length} próximo(s) agendamento(s) na fila.
                            </Typography>
                        </Stack>
                    </Box>
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
                {statCards.map((stat) => (
                    <Box key={stat.key}>
                        <StatCard
                            title={stat.title}
                            value={stats[stat.key]}
                            subtitle={stat.subtitle}
                            icon={stat.icon}
                            color={stat.color}
                            bg={stat.bg}
                        />
                    </Box>
                ))}
            </Box>

            <SectionCard
                title="Receita concluída"
                subtitle="Estimativa calculada pelos serviços de agendamentos concluídos"
                icon={<AttachMoneyRoundedIcon />}
                action={
                    <Chip
                        size="small"
                        label="Tempo real"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            bgcolor: "rgba(47,125,50,0.12)",
                            color: "#2f7d32",
                        }}
                    />
                }
            >
                <Typography variant="h3" fontWeight={900} sx={{ color: "#17181b", lineHeight: 1 }}>
                    {formatCurrency(stats.revenueEstimate)}
                </Typography>
                <Typography sx={{ color: "rgba(17,18,20,0.58)", mt: 1 }}>
                    Este valor é somado em tempo real a partir dos serviços marcados como concluídos.
                </Typography>
            </SectionCard>

            <Grid container spacing={2}>
                <Grid item xs={12} lg={7}>
                    <SectionCard
                        title="Próximos agendamentos"
                        subtitle="Ordem cronológica dos atendimentos que vêm aí"
                        icon={<AccessTimeRoundedIcon />}
                        action={
                            <Chip
                                size="small"
                                label={`${upcomingAppointments.length} na fila`}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 800,
                                    bgcolor: "rgba(17,18,20,0.06)",
                                    color: "#17181b",
                                }}
                            />
                        }
                    >
                        {upcomingAppointments.length === 0 ? (
                            <EmptyAppointments />
                        ) : (
                            <Stack spacing={1.5}>
                                {upcomingAppointments.map((appointment) => {
                                    const { date, time } = getAppointmentDateParts(appointment.starts_at);
                                    const status = statusMetaMap[appointment.status] || {
                                        chipLabel: appointment.status,
                                        color: "#4b5563",
                                        bg: "rgba(75,85,99,0.12)",
                                    };

                                    return (
                                        <Box
                                            key={appointment.id}
                                            sx={{
                                                p: 2,
                                                border: "1px solid rgba(17,18,20,0.08)",
                                                borderRadius: 2,
                                                bgcolor: "rgba(247,244,238,0.58)",
                                            }}
                                        >
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={2}
                                                justifyContent="space-between"
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                                    <Box
                                                        sx={{
                                                            width: 58,
                                                            height: 58,
                                                            borderRadius: 2,
                                                            display: "grid",
                                                            placeItems: "center",
                                                            bgcolor: "#17181b",
                                                            color: "#fff",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <Box sx={{ textAlign: "center" }}>
                                                            <Typography fontWeight={900} sx={{ lineHeight: 1 }}>
                                                                {time}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.66)" }}>
                                                                {date}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography fontWeight={850} sx={{ color: "#17181b" }} noWrap>
                                                            {appointment.client?.name || "Cliente"}
                                                        </Typography>

                                                        <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.58)" }} noWrap>
                                                            {appointment.service?.name || "Serviço"}
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <Chip
                                                    size="small"
                                                    label={status.chipLabel}
                                                    sx={{
                                                        borderRadius: 2,
                                                        fontWeight: 800,
                                                        color: status.color,
                                                        bgcolor: status.bg,
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </SectionCard>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <SectionCard
                        title="Resumo por status"
                        subtitle="Distribuição de todos os agendamentos"
                        icon={<AssignmentTurnedInRoundedIcon />}
                        action={
                            <Chip
                                size="small"
                                icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                                label={`${totalAppointmentsByStatus} total`}
                                sx={{
                                    borderRadius: 2,
                                    fontWeight: 800,
                                    bgcolor: "rgba(31,111,104,0.1)",
                                    color: "#1f6f68",
                                    "& .MuiChip-icon": { color: "#1f6f68" },
                                }}
                            />
                        }
                    >
                        <Stack spacing={2}>
                            {Object.entries(statusMetaMap).map(([statusKey, meta]) => {
                                const value = statusSummary[statusKey] || 0;
                                const percent = totalAppointmentsByStatus ? Math.round((value / totalAppointmentsByStatus) * 100) : 0;

                                return (
                                    <Box key={statusKey}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                            <Typography variant="body2" fontWeight={800} sx={{ color: "#17181b" }}>
                                                {meta.label}
                                            </Typography>

                                            <Typography variant="body2" fontWeight={850} sx={{ color: meta.color }}>
                                                {value}
                                            </Typography>
                                        </Stack>

                                        <LinearProgress
                                            variant="determinate"
                                            value={percent}
                                            sx={{
                                                mt: 1,
                                                height: 9,
                                                borderRadius: 999,
                                                bgcolor: "rgba(17,18,20,0.06)",
                                                "& .MuiLinearProgress-bar": {
                                                    borderRadius: 999,
                                                    bgcolor: meta.color,
                                                },
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Stack>
                    </SectionCard>
                </Grid>
            </Grid>
        </Stack>
    );
}
