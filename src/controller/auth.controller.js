import {
    generateAccessToken,
    signupAdminService,
    loginAdminService,
    loginUserService,
    customSignupUserService,
    verifyEmailService,
    resendEmailVerificationService
} from "../service/auth.service.js";
import { Admin } from "../model/admin.model.js";
import { User } from "../model/user.model.js";
import { COOKIE_OPTIONS, OAUTH_PROVIDERS, ROLES } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";
import passport from "../lib/passport.js";
import { FRONTEND_URL } from "../config/index.js";




// Signup User
export const signupUser = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            provider = OAUTH_PROVIDERS.LOCAL
        } = req.body;

        if (!name || !email || !password) {
            throw new ApiError(400, "All fields are required.")
        }

        const user = await customSignupUserService(
            name,
            email,
            password,
            provider
        )

        res.status(201).json({
            success: true,
            message: "User Created Successfully",
            user
        });

    } catch (error) {
        next(error)
    }
};


// Login User
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "Email and Password are required fields.")
        }

        const user = await loginUserService(email, password);

        const { accessToken } = await generateAccessToken(user._id, User, "User");

        const loggedInUser = await User.findById(user._id).select("-password").lean()

        res.clearCookie("accessToken", COOKIE_OPTIONS)

        res.status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .json({
                message: "Login Successful",
                user: loggedInUser,
                accessToken
            });
    }
    catch (error) {
        next(error)
    }
};


// Signup Admin
export const signupAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new ApiError(400, "All fields are required.")
        }

        const admin = await signupAdminService(name, email, password)

        res.status(201).json({
            message: "Admin Created Successfully",
            id: admin._id.toString()
        });

    } catch (error) {
        next(error)
    }
};


// Login Controller
export const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const admin = await loginAdminService(email, password);
        const { accessToken } = await generateAccessToken(admin._id, Admin, "Admin");

        const loggedInAdmin = await Admin
            .findById(admin._id)
            .select("-password")
            .lean()

        res.clearCookie("accessToken", COOKIE_OPTIONS)

        res.status(200)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .json({
                message: "Login Successful",
                admin: loggedInAdmin,
                accessToken
            });
    }
    catch (error) {
        next(error)
    }
};


// single function to handle login by invoking current controllers as functions
export const login = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (role === ROLES.ADMIN) {
            await loginAdmin(req, res, next);
        }
        else if (role === ROLES.USER) {
            await loginUser(req, res, next);
        }
        else {
            throw new ApiError(400, "Invalid User Type.");
        }
    } catch (error) {
        next(error)
    }
}


export const signup = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (role === ROLES.ADMIN) {
            await signupAdmin(req, res, next);
        }
        else if (role === ROLES.USER) {
            await signupUser(req, res, next);
        }
        else {
            throw new ApiError(400, "Invalid User Type.");
        }
    } catch (error) {
        next(error)
    }
};




export const resendEmailVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        const result = await resendEmailVerificationService(email);

        res
            .status(200)
            .json(result);

    } catch (error) {
        next(error)
    }
};




export const verifyEmail = async (req, res, next) => {
    const { token } = req.query;

    try {
        if (!token) {
            throw new ApiError(400, "Verification token is required.");
        }

        const result = await verifyEmailService(token);

        res.status(200).json(result);
    } catch (error) {
        next(error)
    }
};




// Logout Admin
export const logoutAdmin = async (req, res, next) => {
    try {
        res.clearCookie("accessToken", COOKIE_OPTIONS);
        res.status(200).json({ message: "Admin Logout Successful" });
    } catch (error) {
        next(error)
    }
};


// Logout User
export const logoutUser = async (req, res, next) => {
    try {
        res.clearCookie("accessToken", COOKIE_OPTIONS);
        res.status(200).json({ message: "User Logout Successful" });
    } catch (error) {
        next(error)
    }
};

// Single Logout Handler
export const logout = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (role === ROLES.ADMIN) {
            await logoutAdmin(req, res, next);
        }
        else if (role === ROLES.USER) {
            await logoutUser(req, res, next);
        }
        else {
            throw new ApiError(400, "Invalid User Role");
        }
    } catch (error) {
        next(error)
    }
};

// Google OAuth Controllers
export const googleAuth = (req, res, next) => {
    try {
        // Store the intended redirect URL in session
        if (req.query.redirect) {
            req.session.redirectUrl = req.query.redirect;
        }
        
        // Authenticate with Google
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res, next);
    } catch (error) {
        next(error);
    }
};

export const googleCallback = async (req, res, next) => {
    try {
        passport.authenticate('google', async (err, user, info) => {
            if (err) {
                return res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent(err.message)}`);
            }

            if (!user) {
                return res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
            }

            // Generate access token for the user
            const { accessToken } = await generateAccessToken(user._id, User, "User");

            // Get user without password
            const loggedInUser = await User.findById(user._id).select("-password").lean();

            // Set cookie
            res.cookie("accessToken", accessToken, COOKIE_OPTIONS);

            // Redirect to frontend with success
            const redirectUrl = req.session.redirectUrl || `${FRONTEND_URL}/dashboard`;
            delete req.session.redirectUrl; // Clean up session

            // Redirect with user data as query params (for frontend to handle)
            const userData = encodeURIComponent(JSON.stringify({
                user: loggedInUser,
                accessToken
            }));

            res.redirect(`${redirectUrl}?auth=success&data=${userData}`);
        })(req, res, next);
    } catch (error) {
        next(error);
    }
};

export const googleAuthFailure = (req, res) => {
    res.redirect(`${FRONTEND_URL}/auth/error?message=${encodeURIComponent('Google authentication failed')}`);
};