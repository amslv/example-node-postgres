const { getClient, query, queryParams } = require("../db");
const md5 = require("md5");

const getAllUsers = (request, response) => {
  getClient((errClient, client) => {
    if (errClient) {
      response.send(503, errClient);
    }

    query("SELECT * FROM users;", (err, res) => {
      client.end();
      if (err) {
        response.send(500, err);
      }
      else {
        if (res.rows.length > 0) {
          res = res.rows;
        }
        response.send(200, res);
      }
    }, client);
  });
};

const getUserByCode = (request, response) => {
  const codeUser = parseInt(request.params.codeUser);

  getClient((errClient, client) => {
    if (errClient) {
      response.send(503, errClient);
    }

    queryParams("SELECT * FROM users WHERE code_user = $1", [codeUser], (err, res) => {
      client.end();
      if (err) {
        response.send(500, err);
      }
      else {
        let users = [];
        if (res.rows.length > 0) {
          users = res.rows;
        }
        response.send(200, users);
      }

    }, client);
  });
};

const userLogin = (request, response) => {
  if (request.body) {
    const user = {
      email: request.body.email,
      password: md5(request.body.password)
    };

    getClient((errClient, client) => {
      if (errClient) {
        response.send(503, errClient);
      }

      queryParams("SELECT * FROM users WHERE email = $1 AND password = $2", [user.email, user.password], (err, res) => {
        client.end();
        if (err) {
          response.send(500, err);
        }
        else {
          let logged = false;
          if (res.rows.length > 0) {
            logged = true;
          }

          if (logged) {
            response.send(200, { success: logged });
          }
          else {
            response.send(203, { success: logged });
          }
        }

        client.end();
      }, client);
    });
  }
};

const newUser = (request, response) => {
  if (request.body) {
    const user = {
      name: request.body.name,
      email: request.body.email,
      password: md5(request.body.password)
    };

    getClient((errClient, client) => {
      if (errClient) {
        response.send(503, errClient);
      }

      queryParams("INSERT INTO users (email, name, password) VALUES ($1, $2, $3);", [user.email, user.name, user.password], (err) => {
        client.end();
        let created = true;
        if (err) {
          created = false;
        }

        if (created) {
          response.send(201, { success: created });
        }
        else {
          response.send(200, { success: created });
        }
      }, client);
    });
  }
  else {
    response.send(300);
  }
};

const editUser = (request, response) => {
  if (request.body) {
    const user = {
      name: request.body.name,
      email: request.body.email,
      password: md5(request.body.password)
    };

    getClient((errClient, client) => {
      if (errClient) {
        response.send(503, errClient);
      }

      queryParams("UPDATE users SET (name, password) = ($1, $2) WHERE email = $3 RETURNING *;", [user.name, user.password, user.email], (err, res) => {
        client.end();
        let updated = true;
        if (err || res.rows.length <= 0) {
          updated = false;
        }

        if (updated) {
          response.send(200, { success: updated });
        }
        else {
          response.send(203, { success: updated });
        }
      }, client);
    });
  }
  else {
    response.send(300);
  }
};

const deleteUser = (request, response) => {
  if (request.body) {
    const user = {
      email: request.body.email,
      password: md5(request.body.password)
    };

    getClient((errClient, client) => {
      if (errClient) {
        response.send(503, errClient);
      }

      queryParams("UPDATE users SET status = false WHERE email = $1 AND password = $2;", [user.email, user.password], (err) => {
        client.end();
        let created = true;
        if (err) {
          created = false;
        }

        response.send(200, { success: created });
      }, client);
    });
  }
  else {
    response.send(300);
  }
};

module.exports = {
  getAllUsers: getAllUsers,
  getUserByCode: getUserByCode,
  userLogin: userLogin,
  newUser: newUser,
  editUser: editUser,
  deleteUser: deleteUser
};