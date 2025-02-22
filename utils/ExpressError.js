// =========================== ✅커스텀 서버에러 ===========================
// message와 statusCode를 입력받아 에러를 출력한다
// const err = new ExpressError('Not Found!', 404);
class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}
module.exports = ExpressError
// ========================================================================