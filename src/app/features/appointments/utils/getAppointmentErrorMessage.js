export function getAppointmentErrorMessage(error) {
    const rawMessage = error?.message || "";
    const normalizedMessage = rawMessage.toLowerCase();

    if (normalizedMessage.includes("appointment is outside staff availability")) {
        return "Esse horário está fora da disponibilidade do profissional.";
    }

    if (normalizedMessage.includes("staff already has an overlapping appointment")) {
        return "Esse profissional já possui um agendamento nesse horário.";
    }

    if (normalizedMessage.includes("service duration not found for appointment")) {
        return "Não foi possível validar a duração do serviço para este agendamento.";
    }

    if (normalizedMessage.includes("client_id does not belong to the same barbershop")) {
        return "O cliente selecionado não pertence a esta barbearia.";
    }

    if (normalizedMessage.includes("service_id does not belong to the same barbershop")) {
        return "O serviço selecionado não pertence a esta barbearia.";
    }

    if (normalizedMessage.includes("staff_id does not belong to the same barbershop")) {
        return "O profissional selecionado não pertence a esta barbearia.";
    }

    return rawMessage || "Não foi possível salvar o agendamento.";
}