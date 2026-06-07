import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/u/:userid").get(getUserPlaylists);
router.route("/a/:PlaylistId/:videoId").patch(addVideoToPlaylist);
router.route("/r/:plalistId/:videoId").patch(removeVideoFromPlaylist);
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .delete(deletePlaylist)
  .patch(updatePlaylist);

export default router;
