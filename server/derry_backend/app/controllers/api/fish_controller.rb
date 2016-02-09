class Api::FishController < ApplicationController

  # GET /fish
  def index
    render json: Fish.all
  end

  # GET /fish/1
  def show
    if fish = Fish.find(params[:id])
      render json: fish
    else
      render status: :not_found
    end
  end

  # POST /fish
  def create
    fish = Fish.new(fish_params)

    if fish.save
      render json: fish
    else
      render status: :unprocessable_entity
    end
  end

  # PATCH/PUT /fish/1
  def update
    fish = Fish.find(params[:id])

    if fish && fish.update(fish_params)
      render json: fish
    else
      render status: :unprocessable_entity
    end
  
  end

  # DELETE /fish/1
  def destroy
    fish = Fish.find(params[:id])

    if fish && fish.destroy
      render json: fish
    else
      render status: :unprocessable_entity
    end
  end

  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def fish_params
      params.require(:fish).permit(:name, :category)
    end
end
