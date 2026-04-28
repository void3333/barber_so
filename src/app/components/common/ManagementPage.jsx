import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

export function MetricCard({ title, value, subtitle, icon, color, bg }) {
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

export function DataTableShell({ children, title, subtitle, count, accent = "teal" }) {
    const accentMap = {
        teal: {
            color: "#1f6f68",
            bg: "rgba(31,111,104,0.1)",
        },
        amber: {
            color: "#7a4f1f",
            bg: "rgba(196,138,63,0.14)",
        },
    };
    const colors = accentMap[accent] || accentMap.teal;

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
                        {title}
                    </Typography>

                    <Typography variant="body2" sx={{ color: "rgba(17,18,20,0.56)", mt: 0.3 }}>
                        {subtitle}
                    </Typography>
                </Box>

                <Chip
                    icon={<BadgeRoundedIcon sx={{ fontSize: 17 }} />}
                    label={`${count} registro(s)`}
                    sx={{
                        borderRadius: 2,
                        color: colors.color,
                        bgcolor: colors.bg,
                        fontWeight: 850,
                        "& .MuiChip-icon": { color: colors.color },
                    }}
                />
            </Box>

            {children}
        </Card>
    );
}
