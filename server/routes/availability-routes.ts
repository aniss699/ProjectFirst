
import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get user availability
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT * FROM user_availability 
      WHERE user_id = $1
    `;
    const params: any[] = [parseInt(userId)];

    if (startDate && endDate) {
      query += ` AND date >= $2 AND date <= $3`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY date, start_time`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      availability: result.rows.map(row => ({
        id: row.id,
        date: row.date,
        slots: [{
          start: row.start_time,
          end: row.end_time,
          rate: parseFloat(row.rate)
        }]
      }))
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch availability' 
    });
  }
});

// Save user availability
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid availability data' 
      });
    }

    // Delete existing availability for the user
    await db.query('DELETE FROM user_availability WHERE user_id = $1', [userId]);

    // Insert new availability
    for (const day of availability) {
      const date = typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0];
      
      for (const slot of day.slots) {
        await db.query(
          `INSERT INTO user_availability (user_id, date, start_time, end_time, rate, created_at) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [userId, date, slot.start, slot.end, slot.rate]
        );
      }
    }

    res.json({ 
      success: true, 
      message: 'Availability saved successfully' 
    });
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save availability' 
    });
  }
});

// Get available slots for a specific date
router.get('/slots/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    const result = await db.query(
      `SELECT start_time, end_time, rate 
       FROM user_availability 
       WHERE user_id = $1 AND date = $2 
       ORDER BY start_time`,
      [parseInt(userId), date]
    );

    res.json({
      success: true,
      date,
      slots: result.rows.map(row => ({
        start: row.start_time,
        end: row.end_time,
        rate: parseFloat(row.rate)
      }))
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch slots' 
    });
  }
});

// Delete specific availability slot
router.delete('/:availabilityId', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { availabilityId } = req.params;

    await db.query(
      'DELETE FROM user_availability WHERE id = $1 AND user_id = $2',
      [parseInt(availabilityId), userId]
    );

    res.json({ 
      success: true, 
      message: 'Availability slot deleted' 
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete availability' 
    });
  }
});

// Get recurring availability patterns
router.get('/recurring/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      `SELECT * FROM recurring_availability 
       WHERE user_id = $1 
       ORDER BY day_of_week, start_time`,
      [parseInt(userId)]
    );

    res.json({
      success: true,
      patterns: result.rows.map(row => ({
        id: row.id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        rate: parseFloat(row.rate)
      }))
    });
  } catch (error) {
    console.error('Error fetching recurring availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recurring availability' 
    });
  }
});

// Save recurring availability pattern
router.post('/recurring', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const { dayOfWeek, startTime, endTime, rate } = req.body;

    const result = await db.query(
      `INSERT INTO recurring_availability 
       (user_id, day_of_week, start_time, end_time, rate, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [userId, dayOfWeek, startTime, endTime, rate]
    );

    res.json({ 
      success: true, 
      pattern: result.rows[0] 
    });
  } catch (error) {
    console.error('Error saving recurring availability:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save recurring availability' 
    });
  }
});

export default router;
