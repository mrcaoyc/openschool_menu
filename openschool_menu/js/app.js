var apiHost="http://localhost:10000";
		var app=new Vue({
			el: '#app',
			data:{
				expandAll:true,
				expandOnClickNode:false,
				schoolId:"",
				apiPrefix:"",
				form:{
					name:"",
					path:"",
					parentName:"",
					parentId:"",
					icon:""
				},
				parentForm:{
					name:"",
					path:"",
					icon:""
				},
				updateForm:{
					menuId:"",
					path:"",
					name:"",
					icon:""
				},
				environments:[
					{name:"feature",path:"http://localhost:10000"},
					{name:"develop",path:"https://192.168.200.158:10002"},
					{name:"release",path:"https://192.168.200.159:10002"},
					{name:"master",path:"http://localhost:10005"}
				]
				,
				schools:[],
				formLabelWidth: '120px',
				addDialogVisible:false,
				addFirstLevelDialogVisible:false,
				updateMenuVisible:false,
				menus:[]
			},
			methods:{
				handleResult:function(options){
					const _self=this;
					const loading = _self.loading();
					$.ajax({
				        type:options.type,
						url:_self.apiPrefix+ options.url,
						timeout:5000,
						contentType: "application/json; charset=utf-8",
						data: JSON.stringify(options.data) ,
						dataType: "json",
				        success: function (result) {
				        	if(typeof(options.success) !="undefined"){
				        		options.success(result);
				        	}
				        },
				        error:function(xhr){
				        	console.log(xhr);
				        	if(xhr.status>=400){
				        		_self.$message(xhr.responseText);
				        	}
				        	if(typeof(options.error) !="undefined"){
				        		options.error(xhr);
				        	}
				        },
				        complete:function(xhr){
				        	loading.close();
				        	if(typeof(options.complete) !="undefined"){
				        		options.complete(xhr);
				        	}
				        }
				   });
				},
				loading:function(){
					return this.$loading({
			          lock: true,
			          text: '拼命处理中...',
			          spinner: 'el-icon-loading',
			          background: 'rgba(0, 0, 0, 0.7)'
			        });
				},
				showAppend:function(node){
					var _self=this;
					if(_self.schoolId.trim()==""){
						this.$alert('请输入学校Id');
						return;
					}
					console.log(node)
					_self.form.parentName=node.label;
					_self.form.parentId=node.id;
					_self.form.path="";
					_self.form.icon="";
					_self.addDialogVisible=true;
					return;
				},
				append:function(){
					const _self=this;
					_self.handleResult({
						type: "POST",
				        url: "/api/admin/back_menus?schoolId="+_self.schoolId,
				        data:_self.form,
				        success:function(){
				        	_self.form.parentName="";
				        	_self.form.parentId="";
				        	_self.form.name="";
				        	_self.addDialogVisible=false;
				        	_self.search();
				        }
					});
				},
				showFirstLevel:function(){
					var _self=this;
					if(_self.schoolId.trim()==""){
						this.$alert('请输入学校Id');
						return;
					}
					_self.parentForm.name="";
		        	_self.parentForm.path="";
		        	_self.parentForm.icon="";
					_self.addFirstLevelDialogVisible=true;
				},
				addFirstLevel:function(){
					const _self=this;
					_self.handleResult({
						type: "POST",
				        url: "/api/admin/back_menus?schoolId="+_self.schoolId,
				        data:_self.parentForm,
				        success: function (message) {
				        	_self.addFirstLevelDialogVisible=false;
				        	_self.parentForm.name="";
				        	_self.parentForm.path="";
				        	_self.parentForm.icon="";
				        	_self.search();
				        }
					})
				},
				
				//显示菜单列表
				search:function(){
					
					var _self=this;
					if(_self.schoolId.trim()==""){
						this.$alert('请输入学校Id');
						return;
					}
					this.handleResult({
						type: "get",
						url: "/api/admin/back_menus?schoolId="+_self.schoolId,
						success: function (result) {
				        	_self.menus=[];
				        	_self.copyTree(result,_self.menus);
				        }
					});
				},
				copyTree:function(tree,newTree){
					var _self=this;
					tree.forEach(function(node){
						var newNode={
							id:node.menuId,
							label:node.name,
							children: new Array()
						}
						newTree.push(newNode);
						if(node.children!=null && node.children.length>0){
							_self.copyTree(node.children,newNode.children);
						}
						
					})
				},
				loadSchools:function(){
					var _self=this;
					const loading = _self.loading();
					_self.handleResult({
						url: "/api/common/school/info",
				        success: function (result) {
				        	_self.schools=result;
				        }
					});
				},
				showUpdateMenu:function(node){
					console.log(node)
					
					var _self=this;
					_self.updateForm.name=node.label;
					_self.updateForm.menuId=node.id;
					_self.updateMenuVisible=true;
				},
				updateMenu:function(){
					var _self=this;
					const loading = _self.loading();
					_self.handleResult({
						type: "PATCH",
				        url: "/api/admin/back_menus/"+_self.updateForm.menuId,
				        data:_self.updateForm,
				        success:function(result){
				        	_self.updateMenuVisible=false;
				        	_self.updateForm.name="";
				        	_self.updateForm.path="";
				        	_self.updateForm.icon="";
				        	_self.search();
				     	}
					})
					
				},
				deleteMenu:function(data){
					var _self=this;
					this.$confirm('此操作将永久删除该菜单, 是否继续?', '提示', {
			          confirmButtonText: '确定',
			          cancelButtonText: '取消',
			          type: 'warning'
			        }).then(() => {
			          	_self.handleResult({
			          		type: "DELETE",
				        	url: "/api/admin/back_menus/"+data.id,
				        	data:{},
				        	success:function(){
				        		_self.search();
				        	}
			          	})
			        }).catch(()=>{})
				},
				rankDown:function(data,rank){
					var _self=this;
					_self.handleResult({
			          		type: "PATCH",
				        	url: "/api/admin/back_menus/"+data.id+"/rank",
				        	data:{rank:rank},
				        	success:function(){
				        		_self.search();
				        	}
			          	})
				}
			},
			mounted:function(){
				this.apiPrefix=this.environments[0].path;
				this.loadSchools();
			}
		})