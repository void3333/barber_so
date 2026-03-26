export function getAppointmentErrorMessage(error) {
    const rawMessage = error?.message || "";

    if (rawMessage.includes("appointment is outside staff availability")) {
        return "Esse horário está fora da disponibilidade do profissional.";
    }

    if (rawMessage.includes("staff already has an overlapping appointment")) {
        return "Esse profissional já possui um agendamento nesse horário.";
    }

    if (rawMessage.includes("service duration not found for appointment")) {
        return "Não foi possível validar a duração do serviço para este agendamento.";
    }

    if (rawMessage.includes("client_id does not belong to the same barbershop")) {
        return "O cliente selecionado não pertence a esta barbearia.";
    }

    if (rawMessage.includes("service_id does not belong to the same barbershop")) {
        return "O serviço selecionado não pertence a esta barbearia.";
    }

    if (rawMessage.includes("staff_id does not belong to the same barbershop")) {
        return "O profissional selecionado não pertence a esta barbearia.";
    }

    return rawMessage || "Não foi possível salvar o agendamento.";
}