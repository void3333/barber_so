import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.js";
import { getDashboardOverview } from "../../features/dashboard/api/getDashboardOverview.jsx";

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

function StatCard({ title, value, subtitle, icon }) {
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
                <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                            {title}
                        </Typography>

                        <Box sx={{ color: "text.secondary", display: "flex" }}>
                            {icon}
                        </Box>
                    </Box>

                    <Typography variant="h4" fontWeight={700}>
                        {value}
                    </Typography>

                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

function SectionCard({ title, icon, children }) {
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
                <Stack spacing={3}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>

                        <Typography variant="h6" fontWeight={700}>
                            {title}
                        </Typography>
                    </Box>

                    {children}
                </Stack>
            </CardContent>
        </Card>
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
    // const currentPlan = planLabelMap[barbershop?.plan] || "Sem plano";

    return (
        <Stack spacing={3} sx={{ width: "100%" }}>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Painel Geral
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Olá, {profile?.full_name || "usuário"}. Aqui está o resumo da sua operação.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6} xl={3}>
                    <StatCard
                        title="Clientes"
                        value={stats.totalClients}
                        subtitle="Clientes cadastrados"
                        icon={<PeopleRoundedIcon />}
                    />
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <StatCard
                        title="Serviços"
                        value={stats.totalServices}
                        subtitle="Serviços disponíveis"
                        icon={<ContentCutRoundedIcon />}
                    />
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <StatCard
                        title="Agendamentos"
                        value={stats.totalAppointments}
                        subtitle="Agendamentos no sistema"
                        icon={<EventRoundedIcon />}
                    />
                </Grid>

                <Grid item xs={12} md={6} xl={3}>
                    <StatCard
                        title="Hoje"
                        value={stats.todayAppointments}
                        subtitle="Agendamentos do dia"
                        icon={<TodayRoundedIcon />}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12} lg={7}>
                    <SectionCard
                        title="Próximos agendamentos"
                        icon={<AccessTimeRoundedIcon />}
                    >
                        {upcomingAppointments.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                Nenhum agendamento futuro encontrado.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                {upcomingAppointments.map((appointment) => (
                                    <Box
                                        key={appointment.id}
                                        sx={{
                                            p: 2,
                                            border: 1,
                                            borderColor: "divider",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={2}
                                            justifyContent="space-between"
                                        >
                                            <Box>
                                                <Typography fontWeight={700}>
                                                    {appointment.client?.name || "Cliente"}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary">
                                                    {appointment.service?.name || "Serviço"}
                                                </Typography>
                                            </Box>

                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1}
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    {appointment.starts_at
                                                        ? new Date(appointment.starts_at).toLocaleString("pt-BR")
                                                        : "—"}
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={statusLabelMap[appointment.status] || appointment.status}
                                                    color={statusColorMap[appointment.status] || "default"}
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </SectionCard>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Stack spacing={2} sx={{ height: "100%" }}>
                        <SectionCard
                            title="Resumo por status"
                            icon={<AssignmentTurnedInRoundedIcon />}
                        >
                            <Stack spacing={2}>
                                <Box
                                    sx={{
                                        p: 2,
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Agendados
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        {statusSummary.scheduled}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        p: 2,
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Confirmados
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        {statusSummary.confirmed}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        p: 2,
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Concluídos
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        {statusSummary.completed}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        p: 2,
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Cancelados
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                        {statusSummary.cancelled}
                                    </Typography>
                                </Box>
                            </Stack>
                        </SectionCard>

                        {/*<SectionCard*/}
                        {/*    title="Plano atual"*/}
                        {/*    icon={<WorkspacePremiumRoundedIcon />}*/}
                        {/*>*/}
                        {/*    <Box*/}
                        {/*        sx={{*/}
                        {/*            p: 2,*/}
                        {/*            border: 1,*/}
                        {/*            borderColor: "divider",*/}
                        {/*            borderRadius: 2,*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        <Typography variant="body2" color="text.secondary">*/}
                        {/*            Plano contratado*/}
                        {/*        </Typography>*/}

                        {/*        <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>*/}
                        {/*            {currentPlan}*/}
                        {/*        </Typography>*/}

                        {/*        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>*/}
                        {/*            Barbearia: {barbershop?.name || "—"}*/}
                        {/*        </Typography>*/}
                        {/*    </Box>*/}
                        {/*</SectionCard>*/}
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
}