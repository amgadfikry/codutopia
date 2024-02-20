import mongoDB from "../../databases/mongoDB.js";
import { ObjectId } from "mongodb";

class CoursesControl {
  /* Get all courses method
    get all courses from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async allCourses(req, res) {
    try {
      const courses = await mongoDB.getAll('courses', {});
      return res.status(200).json({ msg: 'Courses found', data: courses });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Get courses by category method
    get all courses by category from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async coursesByCategory(req, res) {
    try {
      const { category } = req.params;
      const courses = await mongoDB.getAll('courses', { category });
      return res.status(200).json({ msg: 'Courses found', data: courses });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Get courses by id method
    get a course by id from the database
    return 200 status code and the course
    if there is an error, return 500 status code
  */
  static async coursesById(req, res) {
    try {
      const { id } = req.params;
      const idObj = new ObjectId(id);
      console.log(idObj);
      const course = await mongoDB.getOne('courses', { _id: idObj });
      return res.status(200).json({ msg: 'Course found', data: course });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }
};

// export the 
export default CoursesControl;
