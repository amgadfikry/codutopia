import mongoDB from "../../databases/mongoDB.js";
import { ObjectId } from "mongodb";
import redisDB from "../../databases/redisDB.js";

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

  /* Get all courses by category method
    get all courses by category from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async coursesByCategory(req, res) {
    try {
      const courses = await mongoDB.getAll('courses', { category: req.params.category });
      return res.status(200).json({ msg: 'Courses found', data: courses });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Get course pagination method that returns a specific number of courses per page
    get a specific number of courses per page from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async coursePagination(req, res) {
    try {
      const { page, limit } = req.params;
      const courses = await mongoDB.pagination('courses', {}, parseInt(page), parseInt(limit));
      return res.status(200).json({ msg: 'Courses found', data: courses });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Get courses by search criteria method
    get all courses by search criteria from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async coursesBySearch(req, res) {
    try {
      const { text } = req.params;
      const courses = await mongoDB.getAll('courses', { title: { $regex: text, $options: 'i' } });
      return res.status(200).json({ msg: 'Courses found', data: courses });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Get courses by search criteria pagination method
    get a specific number of courses per page by search criteria from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async coursesBySearchPagination(req, res) {
    try {
      const { page, limit } = req.params;
      const searchCritria = req.body;
      const courses = await mongoDB.pagination('courses', searchCritria, parseInt(page), parseInt(limit));
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
      const course = await mongoDB.getOne('courses', { _id: new ObjectId(id) });
      return res.status(200).json({ msg: 'Course found', data: course });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Get courses by instructor id method
    get all courses by instructor id from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async coursesByInstructorId(req, res) {
    try {
      const { id } = req.params;
      const courses = await mongoDB.getAll('courses', { instructorId: new ObjectId(id) });
      return res.status(200).json({ msg: 'Courses found', data: courses });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Get all enrolled courses method
    get all enrolled courses from the database
    return 200 status code and the courses
    if there is an error, return 500 status code
  */
  static async enrolledCourses(req, res) {
    try {
      const user = res.locals.user;
      // retrive the ids list from the user object and parse it to an array and map it to an array of ObjectIds
      const userObj = await mongoDB.getOne(user.role, { _id: new ObjectId(user.id) });
      const idsList = userObj.courses.map(course => course.courseId);
      const courses = await mongoDB.getFromList('courses', '_id', idsList);
      return res.status(200).json({ msg: 'Courses found', data: courses });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Create a new course method
    create a new course in the database
    add the course id to the user createdCourses list in the mongo
    add the course id to the user enrolledCourses list in redis
    return 201 status code and the course
    if there is an error, return 500 status code
  */
  static async createCourse(req, res) {
    try {
      const token = res.locals.token;
      const user = res.locals.user;
      const course = req.body;
      // set the instructorId to the user id
      const courseData = {
        ...course,
        instructorId: new ObjectId(user.id),
        reviews: [],
      };
      // add the course to the database
      const newCourse = await mongoDB.addOne('courses', courseData);
      // add the course id to the user createdCourses list in the mongo
      await mongoDB.updateOne(user.role,
        { _id: new ObjectId(user.id) },
        { $push: { courses: newCourse } }
      );
      return res.status(201).json({ msg: 'Course created', courseId: newCourse.toString() });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Update a course method
    update a course in the database
    return 200 status code and the course
    if there is an error, return 500 status code
  */
  static async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const course = req.body;
      await mongoDB.updateOne(
        'courses',
        { _id: new ObjectId(id) },
        { $set: course });
      return res.status(200).json({ msg: 'Course updated' });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Delete a course method
    delete a course from the database mongo
    delete a course from the database redis
    return 200 status code and the course
    if there is an error, return 500 status code
  */
  static async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      const user = res.locals.user;
      // delete the course from the database mongo
      await mongoDB.deleteOne('courses', { _id: new ObjectId(id) });
      // delete the course from the user enrolled courses list in the mongo
      await mongoDB.updateMany(user.role, { courses: new ObjectId(id) }, { $pull: { courses: new ObjectId(id) } });
      return res.status(200).json({ msg: 'Course deleted' });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Enroll in a course method
    add the course id to the user enrolledCourses list in the mongo
    add the course id to the user enrolledCourses list in redis
    return 200 status code and the course
    if there is an error, return 500 status code
  */
  static async enrollCourse(req, res) {
    try {
      const { id } = req.params;
      const user = res.locals.user;
      const courseId = new ObjectId(id);
      // push object of courseId, progress, score to the user courses list in the mongo
      await mongoDB.updateOne(
        user.role,
        { _id: new ObjectId(user.id) },
        { $push: { courses: { courseId, progress: 0, score: 0 } } }
      );
      return res.status(200).json({ msg: 'Course enrolled' });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  /* Unenroll from a course method
    delete the course id from the user enrolledCourses list in the mongo
    delete the course id from the user enrolledCourses list in redis
    return 200 status code and the course
    if there is an error, return 500 status code
  */
  static async unenrollCourse(req, res) {
    try {
      const { id } = req.params;
      const user = res.locals.user;
      const courseId = new ObjectId(id);
      // delete the course id from the user enrolledCourses list in the mongo
      await mongoDB.updateOne(
        user.role,
        { _id: new ObjectId(user.id) },
        { $pull: { courses: { courseId } } }
      );
      return res.status(200).json({ msg: 'Course unenrolled' });
    }
    catch (e) {
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }
};

// export the 
export default CoursesControl;
