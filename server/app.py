import os
from flask import Flask, request, jsonify, g
from dotenv import load_dotenv
import mysql.connector
import logging
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
load_dotenv()

DB_HOST  = os.environ.get('DB_HOST')
DB_PORT  = os.environ.get('DB_PORT')
DB_USER  = os.environ.get('DB_USER')
DB_PASSWORD  = os.environ.get('DB_PASSWORD')
DB_DATABASE  = os.environ.get('DB_DATABASE')
SECRET_PASSWORD = os.environ.get('RSVP_SUMMARY_PASSWORD')

DB_CONFIG = {
    'user': DB_USER,
    'password': DB_PASSWORD,
    'host': DB_HOST,
    'database': DB_DATABASE   
}

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(**DB_CONFIG)
    return g.db

@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify(error=str(e)), 500

@app.teardown_request
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/search_list', methods=['GET'])
def get_search_list():
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM rsvp")
        result = cursor.fetchall()

        result_array = {}
        for res in result:
            displayName = res['display_name']
            if not displayName:
                displayName = ""
            displayName = displayName.lower()
            result_array[displayName] = res['id']
           
        return jsonify(result_array), 200

    except Exception as e:
        logging.error(f"An error occured: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected error occured"}), 500

    

@app.route('/invited_people/<id>', methods=['GET'])
def get_invited_people(id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, display_name, people_confirmed, people_invited, rsvped FROM rsvp where id = %s", (id,))
        result = cursor.fetchone()

        return jsonify(result)
    
    except Exception as e:
        logging.error(f"An error occured: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected error occured"}), 500

@app.route('/rsvp', methods=['POST'])
@app.route('/rsvp', methods=['POST'])
def get_rsvp():
    try:
        data = request.get_json()
        id = data["id"]
        people_confirmed = data["people_confirmed"]
        
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("UPDATE rsvp SET people_confirmed = %s, rsvped = 1 WHERE id = %s", (people_confirmed, id))
        conn.commit()

        return jsonify({"message": "successfully updated"}), 200

    except Exception as e:
        logging.error(f"An error occured: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected error occured"}), 500


@app.route("/search", methods=['POST'])
def search():
    try:
        data = request.get_json()
        searchTerm = data.get('searchTerm')
        searchTerm = searchTerm.lower()
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * from rsvp")
        all_rows = cursor.fetchall()

        # split the search term by spaces
        searchterms = searchTerm.split(" ")

        required_data = []
        for term in searchterms:
            for row in all_rows:
                people = ''
                if row['display_name']:
                    people = row['display_name']
                
                people = people.lower()

                if term in people:
                    required_data.append(row)
    
        return jsonify(required_data), 200

    except Exception as e:
        logging.error(f"An error occured: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected error occured"}), 500
    
@app.route('/rsvp_summary', methods=['GET'])
def rsvp_summary():
    try:
        from dotenv import load_dotenv
        import os
        load_dotenv()

        password = request.args.get('password')
        SECRET_PASSWORD = os.environ.get('RSVP_SUMMARY_PASSWORD')

        if password != SECRET_PASSWORD:
            return jsonify({"error": "Unauthorized access"}), 401

        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT SUM(people_confirmed) AS total_attending FROM rsvp WHERE rsvped = 1 AND people_confirmed > 0")
        result = cursor.fetchone()
        total_attending = result['total_attending'] if result['total_attending'] is not None else 0


        cursor.execute("""
            SELECT display_name, people_confirmed
            FROM rsvp 
            WHERE rsvped = 1 AND people_confirmed > 0
            ORDER BY display_name
        """)
        attending = cursor.fetchall()

        # People who RSVP'd but are not attending (people_confirmed = 0)
        cursor.execute("""
            SELECT display_name
            FROM rsvp 
            WHERE rsvped = 1 AND people_confirmed = 0
            ORDER BY display_name
        """)
        not_attending = cursor.fetchall()

        cursor.execute("SELECT SUM(people_confirmed) AS total_attending FROM rsvp WHERE rsvped = 1 AND people_confirmed > 0")
        result = cursor.fetchone()
        total_attending = result['total_attending'] if result['total_attending'] is not None else 0


        return jsonify({
            "total_attending": total_attending,
            "attending": attending,
            "not_attending": [na["display_name"] for na in not_attending]
        })

    except Exception as e:
        import logging
        logging.error(f"An error occured: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred"}), 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7011, debug=True)
