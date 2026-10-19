export interface MeasurementRequest {
  date: string;
  time: string;
  city: string;
  room: string;
  name: string;
  phone: string;
  projectSummary: string;
}
export interface CRMAdapter {
  submit(
    request: MeasurementRequest,
  ): Promise<{ demo: boolean; message: string }>;
}
export const demoCRM: CRMAdapter = {
  async submit(request) {
    if (!request.name.trim() || request.phone.replace(/\D/g, "").length < 10)
      throw Error("Проверьте имя и телефон.");
    return {
      demo: true,
      message:
        "Демонстрационная запись создана. Данные не отправлены замерщику.",
    };
  },
};
