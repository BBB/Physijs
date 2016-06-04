(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('three')) :
    typeof define === 'function' && define.amd ? define(['three'], factory) :
    (global.physijs = factory(global.THREE));
}(this, function (THREE) { 'use strict';

    THREE = 'default' in THREE ? THREE['default'] : THREE;

    var nextId = 0;
    function getUniqueId() {
    	return nextId++;
    }

    /*
    IF
    geometry is instanceof THREE.Geometry, the three arguments are geometry, material, physics_descriptor
    ELSE
    	the first argument is assumed to be an object Three.js can understand AND
    	IF the second argument is an instanceof THREE.Geometry that geometry is used to determine the physics shape
    	ELSE the object passed as the first argument is assumed to have a `geometry` property

    The next argument in all cases is optional and allows for the object's physical properties to be changed
    The fourth argument in all cases is the getShapeDefinition function
     */
    function PhysicsObject( first, second, third, getShapeDefinition ) {
    	var three_object;
    	var geometry;
    	var physics_descriptor;

    	if ( first instanceof THREE.Geometry ) {
    		geometry = first;
    		three_object = new THREE.Mesh( geometry, second );
    		physics_descriptor = third;
    	} else {
    		three_object = first;
    		if ( second instanceof THREE.Geometry ) {
    			geometry = second;
    			physics_descriptor = third;
    		} else {
    			geometry = three_object.geometry;
    			physics_descriptor = second;
    		}
    	}

    	three_object.rotationAutoUpdate = false;
    	three_object.matrixAutoUpdate = false;

    	three_object.physics = new _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition );
    	three_object.clone = clone.bind( three_object, three_object.clone );

    	return three_object;
    }

    function _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition ) {
    	physics_descriptor = physics_descriptor || {};

    	this.three_object = three_object;
    	this.geometry = geometry;
    	this.getShapeDefinition = getShapeDefinition;

    	this.linear_velocity = new THREE.Vector3();
    	this.angular_velocity = new THREE.Vector3();
    	this.linear_factor = new THREE.Vector3( 1, 1, 1 );
    	this.angular_factor = new THREE.Vector3( 1, 1, 1 );

    	this._ = {
    		id: getUniqueId(),

    		mass: physics_descriptor.mass || Infinity,
    		restitution: physics_descriptor.restitution || 0.1,
    		friction: physics_descriptor.friction || 0.5,
    		linear_damping: physics_descriptor.linear_damping || 0,
    		angular_damping: physics_descriptor.angular_damping || 0,
    		collision_groups: physics_descriptor.collision_groups || 0,
    		collision_mask: physics_descriptor.collision_mask || 0,

    		position: new THREE.Vector3(),
    		quaternion: new THREE.Quaternion(),
    		linear_velocity: new THREE.Vector3(),
    		angular_velocity: new THREE.Vector3(),
    		linear_factor: new THREE.Vector3(1, 1, 1),
    		angular_factor: new THREE.Vector3(1, 1, 1)
    	};

    	this.clone = function( three_object ) {
    		var cloned = new _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition );

    		cloned.mass = this.mass;
    		cloned.restitution = this.restitution;
    		cloned.friction = this.friction;
    		cloned.linear_damping = this.linear_damping;
    		cloned.angular_damping = this.angular_damping;
    		cloned.collision_groups = this.collision_groups;
    		cloned.collision_mask = this.collision_mask;

    		cloned.linear_velocity.copy( this.linear_velocity );
    		cloned.angular_velocity.copy( this.angular_velocity );
    		cloned.linear_factor.copy( this.linear_factor );
    		cloned.angular_factor.copy( this.angular_factor );

    		return cloned;
    	};
    }

    Object.defineProperty(
    	_PhysicsObject.prototype,
    	'mass',
    	{
    		get: function() {
    			return this._.mass;
    		},
    		set: function( mass ) {
    			this._.mass = mass;
    			if ( this.three_object.parent != null ) {
    				this.three_object.parent.physijs.setRigidBodyMass( this );
    			}
    		}
    	}
    );

    Object.defineProperty(
    	_PhysicsObject.prototype,
    	'restitution',
    	{
    		get: function() {
    			return this._.restitution;
    		},
    		set: function( restitution ) {
    			this._.restitution = restitution;
    			if ( this.three_object.parent != null ) {
    				this.three_object.parent.physijs.setRigidBodyRestitution( this );
    			}
    		}
    	}
    );

    Object.defineProperty(
    	_PhysicsObject.prototype,
    	'friction',
    	{
    		get: function() {
    			return this._.friction;
    		},
    		set: function( friction ) {
    			this._.friction = friction;
    			if ( this.three_object.parent != null ) {
    				this.three_object.parent.physijs.setRigidBodyFriction( this );
    			}
    		}
    	}
    );

    Object.defineProperty(
    	_PhysicsObject.prototype,
    	'linear_damping',
    	{
    		get: function() {
    			return this._.linear_damping;
    		},
    		set: function( linear_damping ) {
    			this._.linear_damping = linear_damping;
    			if ( this.three_object.parent != null ) {
    				this.three_object.parent.physijs.setRigidBodyLinearDamping( this );
    			}
    		}
    	}
    );

    Object.defineProperty(
    	_PhysicsObject.prototype,
    	'angular_damping',
    	{
    		get: function() {
    			return this._.angular_damping;
    		},
    		set: function( angular_damping ) {
    			this._.angular_damping = angular_damping;
    			if ( this.three_object.parent != null ) {
    				this.three_object.parent.physijs.setRigidBodyAngularDamping( this );
    			}
    		}
    	}
    );

    Object.defineProperty(
    	_PhysicsObject.prototype,
    	'collision_groups',
    	{
    		get: function() {
    			return this._.collision_groups;
    		},
    		set: function( collision_groups ) {
    			this._.collision_groups = collision_groups;
    			if ( this.three_object.parent != null ) {
    				this.three_object.parent.physijs.setRigidBodyCollisionGroups( this );
    			}
    		}
    	}
    );

    Object.defineProperty(
    	_PhysicsObject.prototype,
    	'collision_mask',
    	{
    		get: function() {
    			return this._.collision_mask;
    		},
    		set: function( collision_mask ) {
    			this._.collision_mask = collision_mask;
    			if ( this.three_object.parent != null ) {
    				this.three_object.parent.physijs.setRigidBodyCollisionMask( this );
    			}
    		}
    	}
    );

    function clone() {
    	var args = Array.prototype.slice.call( arguments );
    	var original_clone = args.shift();

    	var cloned = original_clone.apply( this, args );

    	cloned.physics = this.physics.clone( cloned );

    	return cloned;
    }

    var BODY_TYPES = {
    	/**
    	 * width Float box extent on x axis
    	 * height Float box extent on y axis
    	 * depth Float box extent on z axis
    	 */
    	BOX: 'BOX',

    	/**
    	 * shapes Array list of shape definitions composing the compound shape
    	 */
    	COMPOUND: 'COMPOUND',

    	/**
    	 * radius Float cylinder radius
    	 * height Float cylinder extent on y axis
    	 */
    	CONE: 'CONE',

    	/**
    	 * vertices Array list of vertex components for all vertices, where list is [x1, y1, z1, x2, y2, z2 ... xN, yN, zN]
    	 */
    	CONVEX: 'CONVEX',

    	/**
    	 * radius Float cylinder radius
    	 * height Float cylinder extent on y axis
    	 */
    	CYLINDER: 'CYLINDER',

    	/**
    	 * width Float plane extent on x axis
    	 * height Float plane extent on y axis
    	 */
    	PLANE: 'PLANE',

    	/**
    	 * radius Float radius of the sphere
    	 */
    	SPHERE: 'SPHERE',

    	/**
    	 * vertices Array list of vertex components for all vertices, where list is [x1, y1, z1, x2, y2, z2 ... xN, yN, zN]
    	 * faces Array list of vertex indexes composing the faces
    	 */
    	TRIANGLE: 'TRIANGLE'
    }

    function Box( first, second, third ) {
    	return PhysicsObject.call( this, first, second, third, getShapeDefinition );
    }

    function getShapeDefinition( geometry ) {
    	geometry.computeBoundingBox(); // make sure bounding radius has been calculated

    	return {
    		body_type: BODY_TYPES.BOX,
    		width: geometry.boundingBox.max.x,
    		height: geometry.boundingBox.max.y,
    		depth: geometry.boundingBox.max.z
    	};
    }

    function Cone( first, second, third ) {
    	return PhysicsObject.call( this, first, second, third, getShapeDefinition$1 );
    }

    function getShapeDefinition$1( geometry ) {
    	geometry.computeBoundingBox(); // make sure bounding radius has been calculated

    	return {
    		body_type: BODY_TYPES.CONE,
    		radius: geometry.boundingBox.max.x,
    		height: geometry.boundingBox.max.y
    	};
    }

    function Convex( first, second, third ) {
    	return PhysicsObject.call( this, first, second, third, getShapeDefinition$2 );
    }

    function getShapeDefinition$2( geometry ) {
    	var vertices = geometry.vertices.reduce(
    		function( vertices, vertex ) {
    			vertices.push( vertex.x, vertex.y, vertex.z );
    			return vertices;
    		},
    		[]
    	);

    	return {
    		body_type: BODY_TYPES.CONVEX,
    		vertices: vertices
    	};
    }

    function Cylinder( first, second, third ) {
    	return PhysicsObject.call( this, first, second, third, getShapeDefinition$3 );
    }

    function getShapeDefinition$3( geometry ) {
    	geometry.computeBoundingBox(); // make sure bounding radius has been calculated

    	return {
    		body_type: BODY_TYPES.CYLINDER,
    		radius: geometry.boundingBox.max.x,
    		height: geometry.boundingBox.max.y
    	};
    }

    function Plane( first, second, third ) {
    	return PhysicsObject.call( this, first, second, third, getShapeDefinition$4 );
    }

    function getShapeDefinition$4( geometry ) {
    	geometry.computeBoundingBox(); // make sure bounding radius has been calculated

    	return {
    		body_type: BODY_TYPES.PLANE,
    		width: geometry.boundingBox.max.x,
    		height: geometry.boundingBox.max.y
    	};
    }

    function Sphere( first, second, third ) {
    	return PhysicsObject.call( this, first, second, third, getShapeDefinition$5 );
    }

    function getShapeDefinition$5( geometry ) {
    	geometry.computeBoundingSphere(); // make sure bounding radius has been calculated

    	return {
    		body_type: BODY_TYPES.SPHERE,
    		radius: geometry.boundingSphere.radius
    	};
    }

    function TriangleMesh( first, second, third ) {
    	return PhysicsObject.call( this, first, second, third, getShapeDefinition$6 );
    }

    function getShapeDefinition$6( geometry ) {
    	var vertices = geometry.vertices.reduce(
    		function( vertices, vertex ) {
    			vertices.push( vertex.x, vertex.y, vertex.z );
    			return vertices;
    		},
    		[]
    	);

    	var faces = geometry.faces.reduce(
    		function( faces, face ) {
    			faces.push( face.a, face.b, face.c );
    			return faces;
    		},
    		[]
    	);

    	return {
    		body_type: BODY_TYPES.TRIANGLE,
    		vertices: vertices,
    		faces: faces
    	};
    }

    var CONSTRAINT_TYPES = {
        /**
         * constraint_type String type of constraint
         * constraint_id Number id of the constraint
         * body_a_id Number id of body_a
         * hinge_axis Object axis in body_a the hinge revolves around {x:x, y:y, z:z}
         * point_a Object point in body_a the hinge revolves around {x:x, y:y, z:z}
         * body_b_id [optional] Number id of body_b
         * point_b [optional] Object point in body_b the hinge revolves around {x:x, y:y, z:z}
         * active Boolean whether or not the constraint is enabled
         * factor: Number factor applied to constraint, 0-1
         * breaking_threshold: Number amount of force which, if exceeded, de-activates the constraint
         * limit.enabled Boolean whether or not the limits are set
         * limit.lower Number lower bound of limit
         * limit.upper Number upper bound of limit
         * motor.enabled Boolean whether or not the motor is on
         * motor.torque Number maximum torque the motor can apply
         * motor.max_speed Number maximum speed the motor can reach under its own power
         */
        HINGE: 'HINGE'
    }

    function Constraint() {
        this.constraint_id = getUniqueId();
        this.scene = null;
    };

    function HingeConstraint( body_a, hinge_axis, point_a, body_b, point_b ) {
        Constraint.call( this );

        this.body_a = body_a;
        this.hinge_axis = hinge_axis;
        this.point_a = point_a;
        this.body_b = body_b;
        this.point_b = point_b;

        this.physics = {
            active: true,
            factor: 1,
            breaking_threshold: 0,
            last_impulse: new THREE.Vector3(),
            limit: {
                enabled: false,
                lower: null,
                upper: null
            },
            motor: {
                enabled: false,
                torque: null,
                max_speed: null
            }
        };
    }

    HingeConstraint.prototype = Object.create( Constraint.prototype );
    HingeConstraint.prototype.constructor = HingeConstraint;

    HingeConstraint.prototype.getConstraintDefinition = function() {
        return {
            constraint_type: CONSTRAINT_TYPES.HINGE,
            constraint_id: this.constraint_id,
            body_a_id: this.body_a.physics._.id,
            hinge_axis: { x: this.hinge_axis.x, y: this.hinge_axis.y, z: this.hinge_axis.z },
            point_a: { x: this.point_a.x, y: this.point_a.y, z: this.point_a.z },
            body_b_id: this.body_b == null ? null : this.body_b.physics._.id,
            point_b: this.body_b == null ? null : { x: this.point_b.x, y: this.point_b.y, z: this.point_b.z },

            active: this.physics.active,
            factor: this.physics.factor,
            breaking_threshold: this.physics.breaking_threshold,
            limit: {
                enabled: this.physics.limit.enabled,
                lower: this.physics.limit.lower,
                upper: this.physics.limit.upper
            },
            motor: {
                enabled: this.physics.motor.enabled,
                torque: this.physics.motor.torque,
                max_speed: this.physics.motor.max_speed
            }
        };
    };

    HingeConstraint.prototype.setActive = function( active ) {
        this.physics.active = active;
    };

    HingeConstraint.prototype.setLimit = function( lower, upper ) {
        this.physics.limit.enabled = lower != null || upper != null;
        this.physics.limit.lower = lower;
        this.physics.limit.upper = upper;
    };

    HingeConstraint.prototype.setMotor = function( torque, max_speed ) {
        this.physics.motor.enabled = torque != null || max_speed != null;
        this.physics.motor.torque = torque;
        this.physics.motor.max_speed = max_speed;
    };

    function CompoundObject( object, physics_descriptor ) {
    	if ( physics_descriptor == null ) {
    		throw new Error( 'Physijs: attempted to create rigid body without specifying physics details' );
    	}

    	if ( object.physics instanceof _PhysicsObject ) {
    		object.physics.getShapeDefinition = getShapeDefinition$7.bind( null, object, object.physics.getShapeDefinition );
    	} else {
    		object.physics = new _PhysicsObject( object, null, physics_descriptor, getShapeDefinition$7.bind( null, object ) );
    	}

    	object.rotationAutoUpdate = false;
    	object.matrixAutoUpdate = false;

    	object.clone = clone.bind( object, object.clone );

    	return object;
    }


    function getShapeDefinition$7( object, originalShapeDefinition ) {
    	var shapes = [];

    	var position_offset = new THREE.Vector3();
    	var quaternion_offset = new THREE.Quaternion();

    	object.updateMatrix();
    	object.updateMatrixWorld( true );
    	var parent_inverse_world = new THREE.Matrix4().getInverse( object.matrixWorld );
    	var childMatrix = new THREE.Matrix4();

    	object.traverse(function( child ) {
    		child.updateMatrix();
    		child.updateMatrixWorld( true );

    		if ( child.physics instanceof _PhysicsObject ) {
    			var shapeDefinition;
    			if ( originalShapeDefinition != null ) {
    				shapeDefinition = originalShapeDefinition( child.physics.geometry );
    			} else if ( object !== child ) {
    				shapeDefinition = child.physics.getShapeDefinition( child.physics.geometry );
    			}

    			if ( shapeDefinition != null ) {
    				childMatrix.copy( child.matrixWorld ).multiply( parent_inverse_world );
    				position_offset.setFromMatrixPosition( childMatrix );
    				quaternion_offset.setFromRotationMatrix( childMatrix );
    				shapes.push({
    					position: {x: position_offset.x, y: position_offset.y, z: position_offset.z},
    					quaternion: {
    						x: quaternion_offset._x,
    						y: quaternion_offset._y,
    						z: quaternion_offset._z,
    						w: quaternion_offset._w
    					},
    					shape_definition: shapeDefinition
    				});
    			}
    		}
    	});

    	return {
    		body_type: BODY_TYPES.COMPOUND,
    		shapes: shapes
    	};
    }

    var MESSAGE_TYPES = {
    	REPORTS: {
    		/**
    		 * world report containing matrix data for rigid bodies
    		 * element [1] is how many simulation ticks have been processed (world.ticks)
    		 * element [2] is number of rigid bodies in the array
    		 * 2...n elements are the bodies' matrix data
    		 */
    		WORLD: 0,

    		/**
    		 * contains details for new contacts
    		 * element [1] is the number of collisions, each collision is represented by:
    		 * [object_a_id, object_b_id, world_contact_point{xyz}, contact_normal{xyz}, linear_velocity_delta{xyz}, angular_velocity_delta{xyz}, penetration_depth]
    		 */
    		COLLISIONS: 1
    	},

    	/**
    	 * initializes the physics world
    	 * [broadphase] String either 'sap' or 'naive' [default 'sap']
    	 * [gravity] Object with float properties `x`, `y`, `z` [default {x:0, y:-9.8, z:0} ]
    	 */
    	INITIALIZE: 'INITIALIZE',

    	/**
    	 * adds a rigid body to the world
    	 * body_id Integer unique id for the body
    	 * shape_description Object definition corresponding to the type of rigid body (see BODY_TYPES)
    	 * mass Float amount of mass the body has, 0 or Infinity creates a static object
    	 * restitution Float body's restitution
    	 * friction Float body's friction
    	 * linear_damping Float body's linear damping
    	 * angular_damping Float body's angular damping
    	 * collision_groups Integer body's collision groups
    	 * collision_mask Integer body's collision mask
    	 */
    	ADD_RIGIDBODY: 'ADD_RIGIDBODY',

    	/**
    	 * removes a rigid body from the world
    	 * body_id Integer unique id of the body
    	 */
    	REMOVE_RIGIDBODY: 'REMOVE_RIGIDBODY',

    	/**
    	 * sets the specified rigid body's mass
    	 * body_id Integer unique integer id for the body
    	 * mass Float new mass value
    	 */
    	SET_RIGIDBODY_MASS: 'SET_RIGIDBODY_MASS',

    	/**
    	 * sets the specified rigid body's restitution
    	 * body_id Integer unique integer id for the body
    	 * mass Float new restitution value
    	 */
    	SET_RIGIDBODY_RESTITUTION: 'SET_RIGIDBODY_RESTITUTION',

    	/**
    	 * sets the specified rigid body's friction
    	 * body_id Integer unique integer id for the body
    	 * mass Float new friction value
    	 */
    	SET_RIGIDBODY_FRICTION: 'SET_RIGIDBODY_FRICTION',

    	/**
    	 * sets the specified rigid body's linear damping
    	 * body_id Integer unique integer id for the body
    	 * damping Float new linear damping value
    	 */
    	SET_RIGIDBODY_LINEAR_DAMPING: 'SET_RIGIDBODY_LINEAR_DAMPING',

    	/**
    	 * sets the specified rigid body's angular damping
    	 * body_id Integer unique integer id for the body
    	 * damping Float new angular damping value
    	 */
    	SET_RIGIDBODY_ANGULAR_DAMPING: 'SET_RIGIDBODY_ANGULAR_DAMPING',

    	/**
    	 * sets the specified rigid body's collision groups
    	 * body_id Integer unique integer id for the body
    	 * groups Integer new collision group value
    	 */
    	SET_RIGIDBODY_COLLISION_GROUPS: 'SET_RIGIDBODY_COLLISION_GROUPS',

    	/**
    	 * sets the specified rigid body's collision mask
    	 * body_id Integer unique integer id for the body
    	 * mask Integer new collision mask value
    	 */
    	SET_RIGIDBODY_COLLISION_MASK: 'SET_RIGIDBODY_COLLISION_MASK',

    	/**
    	 * sets the specified rigid body's position & rotation
    	 * body_id Integer unique integer id for the body
    	 * position Object new coordinates for the body's position, {x:x, y:y, z:z}
    	 * rotation Object new quaternion values {x:x, y:y, z:z, w:w}
    	 */
    	SET_RIGIDBODY_TRANSFORM: 'SET_RIGIDBODY_TRANSFORM',

    	/**
    	 * sets the specified rigid body's linear velocity
    	 * body_id Integer unique integer id for the body
    	 * velocity Object new values for the body's linear velocity, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_LINEAR_VELOCITY: 'SET_RIGIDBODY_LINEAR_VELOCITY',

    	/**
    	 * sets the specified rigid body's angular velocity
    	 * body_id Integer unique integer id for the body
    	 * velocity Object new values for the body's angular velocity, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_ANGULAR_VELOCITY: 'SET_RIGIDBODY_ANGULAR_VELOCITY',

    	/**
    	 * sets the specified rigid body's linear factor
    	 * body_id Integer unique integer id for the body
    	 * factor Object new values for the body's linear factor, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_LINEAR_FACTOR: 'SET_RIGIDBODY_LINEAR_FACTOR',

    	/**
    	 * sets the specified rigid body's angular factor
    	 * body_id Integer unique integer id for the body
    	 * factor Object new values for the body's angular factor, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_ANGULAR_FACTOR: 'SET_RIGIDBODY_ANGULAR_FACTOR',

    	/**
    	 * steps the physics simulation
    	 * time_delta Float total amount of time, in seconds, to step the simulation by
    	 * [max_step] Float maximum step of size, in seconds [default is value of `time_delta`]
    	 */
    	STEP_SIMULATION: 'STEP_SIMULATION',

    	/**
    	 * performs ray traces
    	 * raytrace_id unique identifier for this request
    	 * rays Array[ { start: { x:x, y:y, z:z }, end: { x:x, y:y, z:z } } ]
    	 */
    	RAYTRACE: 'RAYTRACE',

    	/**
    	 * results of a raytrace request
    	 * raytrace_id unique identifier of the request
    	 * results Array[ Array[ { body_id:body_id, point: { x:x, y:y, z:z }, normal: { x:x, y:y, z:z } } ] ]
    	 */
    	RAYTRACE_RESULTS: 'RAYTRACE_RESULTS',

    	/**
    	 * adds a constraint on one or two bodies to the world
    	 * entirety of the message body corresponds to the type of constraint (see CONSTRAINT_TYPES)
    	 */
    	ADD_CONSTRAINT: 'ADD_CONSTRAINT'
    };

    var _tmp_vector3_1 = new THREE.Vector3();
    var _tmp_vector3_2 = new THREE.Vector3();
    var _tmp_vector3_3 = new THREE.Vector3();
    var _tmp_vector3_4 = new THREE.Vector3();

    function getRigidBodyDefinition( object ) {
    	var shape_definition = object.physics.getShapeDefinition( object.physics.geometry );

    	return {
    		body_id: object.physics._.id,
    		shape_definition: shape_definition,
    		mass: object.physics._.mass,
    		restitution: object.physics._.restitution,
    		friction: object.physics._.friction,
    		linear_damping: object.physics._.linear_damping,
    		angular_damping: object.physics._.angular_damping,
    		collision_groups: object.physics._.collision_groups,
    		collision_mask: object.physics._.collision_mask
    	};
    }

    function Scene( worker_script_location, world_config ) {
    	THREE.Scene.call( this );

    	this.physijs = {
    		handlers: {},
    		handleMessage: handleMessage.bind( this ),

    		is_stepping: false,
    		id_body_map: {},
    		id_constraint_map: {},
    		onStep: null,

    		initializeWorker: initializeWorker.bind( this ),
    		processWorldReport: processWorldReport.bind( this ),
    		processCollisionReport: processCollisionReport.bind( this ),
    		postMessage: postMessage.bind( this ),
    		postReport: postReport.bind( this ),
    		setRigidBodyMass: setRigidBodyMass.bind( this ),
    		setRigidBodyRestitution: setRigidBodyRestitution.bind( this ),
    		setRigidBodyFriction: setRigidBodyFriction.bind( this ),
    		setRigidBodyLinearDamping: setRigidBodyLinearDamping.bind( this ),
    		setRigidBodyAngularDamping: setRigidBodyAngularDamping.bind( this ),
    		setRigidBodyCollisionGroups: setRigidBodyCollisionGroups.bind( this ),
    		setRigidBodyCollisionMask: setRigidBodyCollisionMask.bind( this ),
    		setRigidBodyTransform: setRigidBodyTransform.bind( this ),
    		setRigidBodyLinearVelocity: setRigidBodyLinearVelocity.bind( this ),
    		setRigidBodyAngularVelocity: setRigidBodyAngularVelocity.bind( this ),
    		setRigidBodyLinearFactor: setRigidBodyLinearFactor.bind( this ),
    		setRigidBodyAngularFactor: setRigidBodyAngularFactor.bind( this ),

    		inflight_raytraces: {},
    		processRaytraceResults: processRaytraceResults.bind( this )
    	};

    	this.physics = {
    		raytrace: raytrace.bind( this )
    	};

    	this.physijs.initializeWorker( worker_script_location, world_config );
    }

    Scene.prototype = Object.create( THREE.Scene.prototype );
    Scene.prototype.constructor = Scene;

    Scene.prototype.add = function( object ) {
    	if ( object instanceof Constraint ) {
    		object.scene = this;
    		var constraint_definition = object.getConstraintDefinition();
    		this.physijs.id_constraint_map[ constraint_definition.constraint_id ] = object;
    		// ensure the body(ies) transforms have been set
    		this.physijs.setRigidBodyTransform( object.body_a );
    		if ( object.body_b != null ) {
    			this.physijs.setRigidBodyTransform( object.body_b );
    		}
    		this.physijs.postMessage( MESSAGE_TYPES.ADD_CONSTRAINT, constraint_definition );
    		return;
    	}

    	THREE.Scene.prototype.add.call( this, object );

    	if ( object.physics instanceof _PhysicsObject ) {
    		var rigid_body_definition = getRigidBodyDefinition( object );
    		this.physijs.id_body_map[ rigid_body_definition.body_id ] = object;
    		this.physijs.postMessage( MESSAGE_TYPES.ADD_RIGIDBODY, rigid_body_definition );
    		object.updateMatrix();
    	}
    };

    Scene.prototype.remove = function( object ) {
    	THREE.Scene.prototype.remove.call( this, object );

    	if ( object.physics instanceof _PhysicsObject ) {
    		delete this.physijs.id_body_map[ object.physics._.id ];
    		this.physijs.postMessage( MESSAGE_TYPES.REMOVE_RIGIDBODY, { body_id: object.physics._.id } );
    	}
    };

    Scene.prototype.step = function( time_delta, max_step, onStep ) {
    	if ( this.physijs.is_stepping === true ) {
    		throw new Error( 'Physijs: scene is already stepping, cannot call step() until it\'s finished' );
    	}

    	this.physijs.is_stepping = true;
    	this.physijs.onStep = onStep;

    	// check if any rigid bodies have been toyed with
    	var rigid_body_ids = Object.keys( this.physijs.id_body_map );
    	for ( var i = 0; i < rigid_body_ids.length; i++ ) {
    		var rigid_body_id = rigid_body_ids[ i ];
    		var rigid_body = this.physijs.id_body_map[ rigid_body_id ];
    		if ( rigid_body == null ) {
    			continue;
    		}

    		// check position/rotation
    		if ( !rigid_body.position.equals( rigid_body.physics._.position ) || !rigid_body.quaternion.equals( rigid_body.physics._.quaternion ) ) {
    			this.physijs.setRigidBodyTransform( rigid_body );
    		}

    		// check linear velocity
    		if ( !rigid_body.physics.linear_velocity.equals( rigid_body.physics._.linear_velocity ) ) {
    			this.physijs.setRigidBodyLinearVelocity( rigid_body );
    		}

    		// check angular velocity
    		if ( !rigid_body.physics.angular_velocity.equals( rigid_body.physics._.angular_velocity ) ) {
    			this.physijs.setRigidBodyAngularVelocity( rigid_body );
    		}

    		// check linear factor
    		if ( !rigid_body.physics.linear_factor.equals( rigid_body.physics._.linear_factor ) ) {
    			this.physijs.setRigidBodyLinearFactor( rigid_body );
    			rigid_body.physics._.linear_factor.copy( rigid_body.physics.linear_factor );
    		}

    		// check angular factor
    		if ( !rigid_body.physics.angular_factor.equals( rigid_body.physics._.angular_factor ) ) {
    			this.physijs.setRigidBodyAngularFactor( rigid_body );
    			rigid_body.physics._.angular_factor.copy( rigid_body.physics.angular_factor );
    		}
    	}

    	this.physijs.postMessage(
    		MESSAGE_TYPES.STEP_SIMULATION,
    		{
    			time_delta: time_delta,
    			max_step: max_step
    		}
    	);
    };

    function raytrace( rays, callback ) {
    	var raytrace_id = getUniqueId();

    	this.physijs.postMessage(
    		MESSAGE_TYPES.RAYTRACE,
    		{
    			raytrace_id: raytrace_id,
    			rays: rays.map(function(ray) {
    				return {
    					start: {
    						x: ray.start.x,
    						y: ray.start.y,
    						z: ray.start.z
    					},
    					end: {
    						x: ray.end.x,
    						y: ray.end.y,
    						z: ray.end.z
    					}
    				};
    			})
    		}
    	);

    	this.physijs.inflight_raytraces[ raytrace_id ] = callback;
    }

    function handleMessage( message, handler ) {
    	this.physijs.handlers[message] = handler;
    }

    function initializeWorker( worker_script_location, world_config ) {
    	this.physijs.worker = new Worker( worker_script_location );
    	this.physijs.worker.addEventListener(
    		'message',
    		function(e) {
    			var data = e.data;
    			var type;
    			var parameters;

    			if ( data instanceof Float32Array ) {
    				type = data[0];
    				parameters = data;
    			} else {
    				data = data || {};
    				type = data.type;
    				parameters = data.parameters;
    			}

    			if ( this.physijs.handlers.hasOwnProperty( type ) ) {
    				this.physijs.handlers[type]( parameters );
    			} else {
    				throw new Error( 'Physijs scene received unknown message type: ' + type );
    			}
    		}.bind( this )
    	);

    	this.physijs.handleMessage(
    		MESSAGE_TYPES.REPORTS.WORLD,
    		this.physijs.processWorldReport
    	);

    	this.physijs.handleMessage(
    		MESSAGE_TYPES.REPORTS.COLLISIONS,
    		this.physijs.processCollisionReport
    	);

    	this.physijs.handleMessage(
    		MESSAGE_TYPES.RAYTRACE_RESULTS,
    		this.physijs.processRaytraceResults
    	);

    	this.physijs.postMessage( MESSAGE_TYPES.INITIALIZE, world_config || {} );
    }

    function processWorldReport( report ) {
    	var simulation_ticks = report[1];
    	var rigid_body_count = report[2];

    	for ( var i = 0; i < rigid_body_count; i++ ) {
    		var idx = 3 + i * 30; // [WORLD, # TICKS, # BODIES, n*30 elements ...]
    		var rigid_body_id = report[idx++];
    		var rigid_body = this.physijs.id_body_map[ rigid_body_id ];
    		if ( rigid_body == null ) {
    			continue;
    		}

    		rigid_body.matrix.set(
    			report[idx++], report[idx++], report[idx++], report[idx++],
    			report[idx++], report[idx++], report[idx++], report[idx++],
    			report[idx++], report[idx++], report[idx++], report[idx++],
    			report[idx++], report[idx++], report[idx++], report[idx++]
    		);

    		rigid_body.position.copy( rigid_body.physics._.position.set( report[idx++], report[idx++], report[idx++] ) );
    		rigid_body.quaternion.copy( rigid_body.physics._.quaternion.set( report[idx++], report[idx++], report[idx++], report[idx++] ) );
    		rigid_body.physics.linear_velocity.copy( rigid_body.physics._.linear_velocity.set( report[idx++], report[idx++], report[idx++] ) );
    		rigid_body.physics.angular_velocity.copy( rigid_body.physics._.angular_velocity.set( report[idx++], report[idx++], report[idx++] ) );
    	}

    	// send the buffer back for re-use
    	this.physijs.postReport( report );

    	// world report is over, we're no longer stepping
    	this.physijs.is_stepping = false;
    	if ( this.physijs.onStep instanceof Function ) {
    		var onStep = this.physijs.onStep;
    		this.physijs.onStep = null;
    		onStep.call( this, simulation_ticks );
    	}
    }

    function processCollisionReport( report ) {
    	var new_contacts = report[1];

    	for ( var i = 0; i < new_contacts; i += 15 ) {
    		var idx = i + 2;
    		var object_a = this.physijs.id_body_map[report[idx+0]];
    		var object_b = this.physijs.id_body_map[report[idx+1]];

    		if ( object_a == null || object_b == null ) {
    			debugger;
    			continue;
    		}

    		_tmp_vector3_1.set( report[idx+2], report[idx+3], report[idx+4] );
    		_tmp_vector3_2.set( report[idx+5], report[idx+6], report[idx+7] );
    		_tmp_vector3_3.set( report[idx+8], report[idx+9], report[idx+10] );
    		_tmp_vector3_4.set( report[idx+11], report[idx+12], report[idx+13] );

    		object_a.dispatchEvent({
    			type: 'physics.newContact',
    			other_body: object_b,
    			contact_point: _tmp_vector3_1,
    			contact_normal: _tmp_vector3_2,
    			relative_linear_velocity: _tmp_vector3_3,
    			relative_angular_velocity: _tmp_vector3_4,
    			penetration_depth: report[idx+14]
    		});

    		object_b.dispatchEvent({
    			type: 'physics.newContact',
    			other_body: object_a,
    			contact_point: _tmp_vector3_1,
    			contact_normal: _tmp_vector3_2,
    			relative_linear_velocity: _tmp_vector3_3,
    			relative_angular_velocity: _tmp_vector3_4,
    			penetration_depth: report[idx+14]
    		});
    	}

    	this.physijs.postReport( report );
    }

    function postMessage( type, parameters ) {
    	this.physijs.worker.postMessage({
    		type: type,
    		parameters: parameters
    	});
    }

    function postReport( report ) {
    	this.physijs.worker.postMessage( report, [report.buffer] );
    }

    function setRigidBodyMass( physics_object ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_MASS,
    		{
    			body_id: physics_object._.id,
    			mass: physics_object._.mass
    		}
    	);
    }

    function setRigidBodyRestitution( physics_object ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_RESTITUTION,
    		{
    			body_id: physics_object._.id,
    			restitution: physics_object._.restitution
    		}
    	);
    }

    function setRigidBodyFriction( physics_object ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_FRICTION,
    		{
    			body_id: physics_object._.id,
    			friction: physics_object._.friction
    		}
    	);
    }

    function setRigidBodyLinearDamping( physics_object ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_DAMPING,
    		{
    			body_id: physics_object._.id,
    			damping: physics_object._.linear_damping
    		}
    	);
    }

    function setRigidBodyAngularDamping( physics_object ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_DAMPING,
    		{
    			body_id: physics_object._.id,
    			damping: physics_object._.angular_damping
    		}
    	);
    }

    function setRigidBodyCollisionGroups( physics_object ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_GROUPS,
    		{
    			body_id: physics_object._.id,
    			collision_groups: physics_object._.collision_groups
    		}
    	);
    }

    function setRigidBodyCollisionMask( physics_object ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_MASK,
    		{
    			body_id: physics_object._.id,
    			collision_mask: physics_object._.collision_mask
    		}
    	);
    }

    function setRigidBodyTransform( body ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_TRANSFORM,
    		{
    			body_id: body.physics._.id,
    			position: { x: body.position.x, y: body.position.y, z: body.position.z },
    			rotation: { x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w }
    		}
    	);
    }

    function setRigidBodyLinearVelocity( body ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_VELOCITY,
    		{
    			body_id: body.physics._.id,
    			velocity: { x: body.physics.linear_velocity.x, y: body.physics.linear_velocity.y, z: body.physics.linear_velocity.z }
    		}
    	);
    }

    function setRigidBodyAngularVelocity( body ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_VELOCITY,
    		{
    			body_id: body.physics._.id,
    			velocity: { x: body.physics.angular_velocity.x, y: body.physics.angular_velocity.y, z: body.physics.angular_velocity.z }
    		}
    	);
    }

    function setRigidBodyLinearFactor( body ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_FACTOR,
    		{
    			body_id: body.physics._.id,
    			factor: { x: body.physics.linear_factor.x, y: body.physics.linear_factor.y, z: body.physics.linear_factor.z }
    		}
    	);
    }

    function setRigidBodyAngularFactor( body ) {
    	this.physijs.postMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_FACTOR,
    		{
    			body_id: body.physics._.id,
    			factor: { x: body.physics.angular_factor.x, y: body.physics.angular_factor.y, z: body.physics.angular_factor.z }
    		}
    	);
    }

    function processRaytraceResults( response ) {
    	var callback = this.physijs.inflight_raytraces[ response.raytrace_id ];
    	var scene = this;
    	callback(
    		response.results.map(function( ray ) {
    			return ray.map(function( intersection ) {
    				return {
    					body: scene.physijs.id_body_map[ intersection.body_id ],
    					point: new THREE.Vector3( intersection.point.x, intersection.point.y, intersection.point.z ),
    					normal: new THREE.Vector3( intersection.normal.x, intersection.normal.y, intersection.normal.z )
    				}
    			});
    		}, scene)
    	);
    }

    var index = {
    	PhysicsObject: PhysicsObject,
    	Box: Box,
    	Cone: Cone,
    	Convex: Convex,
    	Cylinder: Cylinder,
    	Plane: Plane,
    	Sphere: Sphere,
    	TriangleMesh: TriangleMesh,

    	HingeConstraint: HingeConstraint,

    	CompoundObject: CompoundObject,
    	Scene: Scene
    };

    return index;

}));