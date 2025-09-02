import express from 'express';
import Note from '../database/models/NoteModel.js';
import verifyToken from '../middlewares/VerifyJwt.js';

const router = express.Router();

router.get("/all", verifyToken, async (req, res) => {
  try {
    const allNotes = await Note.find({ 
        user_id: req.user.user_id 
    }).sort({ createdAt: -1 });
    res.json({ 
        success: true, 
        msg: "All notes retrieved", 
        allNotes 
    });
  } catch (err) {
    res.json({ 
        success: false, 
        msg: err.message 
    });
  }
});

router.post("/new", verifyToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.json({ success: false, msg: "Note is empty" });

  try {
    await Note.create({ 
        content: content.trim(), 
        user_id: req.user.user_id 
    });
    res.json({ 
        success: true, 
        msg: "Note added" 
    });
  } catch (err) {
    res.json({ 
        success: false, 
        msg: err.message 
    });
  }
});

router.patch("/edit", verifyToken, async (req, res) => {
  try {
    const { note_id, content } = req.body;
    if (!note_id || !content || !content.trim()) {
    return res.json({ 
            success: false, 
            msg: "Note ID and content required" 
    })}
    const note = await Note.findOne({ 
        _id: note_id, 
        user_id: req.user.user_id 
    });
    if (!note) {
        return res.json({ 
            success: false, 
            msg: "Note not found" 
       })
    }

    note.content = content.trim();
    await note.save();
    res.json({ 
        success: true, 
        msg: "Note updated successfully", 
        updatedNote: note 
    });
  } catch (err) {
    res.json({ 
        success: false, 
        msg: err.message 
    });
  }
});

router.delete("/delete", verifyToken, async (req, res) => {
  try {
    const { note_id } = req.body;
    if (!note_id){
        return res.json({ 
            success: false, 
            msg: "Note ID required" 
        });
    }

    await Note.findOneAndDelete({ 
        _id: note_id, 
        user_id: req.user.user_id 
    });
    res.json({ 
        success: true, 
        msg: "Deleted successfully" 
    });
  } catch (err) {
    res.json({ 
        success: false, 
        msg: err.message 
    });
  }
});

export default router;
