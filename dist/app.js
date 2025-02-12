"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userAuth_1 = __importDefault(require("./middlewares/userAuth"));
const user_controller_1 = require("./controllers/user.controller");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 3000;
app.get('/api', (req, res) => {
    res.send('Server is running');
});
app.post('/api/user/signUp', user_controller_1.signUp);
app.post('/api/user/login', user_controller_1.login);
const user_routes_1 = __importDefault(require("./routes/user.routes"));
app.use('/api/user', userAuth_1.default, user_routes_1.default);
const track_routes_1 = __importDefault(require("./routes/track.routes"));
app.use('/api/track', userAuth_1.default, track_routes_1.default);
const area_routes_1 = __importDefault(require("./routes/area.routes"));
app.use('/api/area', userAuth_1.default, area_routes_1.default);
const listings_routes_1 = __importDefault(require("./routes/listings.routes"));
app.use('/api/listings', listings_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
